package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import ru.korusconsulting.projectneo.core.services.filestorage.FileStorageService;
import ru.korusconsulting.projectneo.core.services.filestorage.dto.response.FileStorageResponse;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItemService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.response.ProcurementItemDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysisService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response.ProcurementKpAnalysisDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocumentService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.response.ProcurementKpDocumentDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.ocr.ProcurementOcrService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper.ParsedN8nResponse;

@Service
@Slf4j
public class ProcurementKpAnalysisWorkflow {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String STATUS_NOT_STARTED = "not_started";
    private static final String STATUS_COMPLETED = "completed";
    private static final String STATUS_FAILED = "failed";

    private final ProcurementKpDocumentService kpDocumentService;
    private final ProcurementPackageService packageService;
    private final ProcurementItemService itemService;
    private final ProcurementKpAnalysisService analysisService;
    private final ProcurementOcrService ocrService;
    private final FileStorageService fileStorageService;
    private final ProcurementN8nHelper procurementN8nHelper;
    private final Path fileStorageRoot;

    @Autowired
    public ProcurementKpAnalysisWorkflow(
            ProcurementKpDocumentService kpDocumentService,
            ProcurementPackageService packageService,
            ProcurementItemService itemService,
            ProcurementKpAnalysisService analysisService,
            ProcurementOcrService ocrService,
            FileStorageService fileStorageService,
            ProcurementN8nHelper procurementN8nHelper) {
        this.kpDocumentService = kpDocumentService;
        this.packageService = packageService;
        this.itemService = itemService;
        this.analysisService = analysisService;
        this.ocrService = ocrService;
        this.fileStorageService = fileStorageService;
        this.procurementN8nHelper = procurementN8nHelper;
        this.fileStorageRoot = resolveStorageRoot();
    }

    public ProcurementKpAnalysisDto extract(UUID kpDocumentId) {
        ProcurementKpDocumentDto document = requireDocument(kpDocumentId);
        requirePackage(document.getPackageId());
        String text = readDocumentText(document);
        OffsetDateTime extractedAt = OffsetDateTime.now();

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("offer", Map.of("text", text));

            ParsedN8nResponse response = procurementN8nHelper.post("/webhook/procurement/extract-kp", payload);
            JsonNode parsed = response.parsed();
            if (parsed == null || !parsed.isObject()) {
                throw new IllegalStateException("KP extraction returned empty or invalid response");
            }

            ProcurementKpAnalysisDto result = mergeWithExisting(kpDocumentId);
            String supplierName = textValue(parsed.get("supplier_name"));

            result.setSourceText(text);
            result.setExtractionStatus(STATUS_COMPLETED);
            result.setAnalysisStatus(STATUS_NOT_STARTED);
            result.setExtractedAt(extractedAt);
            result.setAnalyzedAt(null);
            result.setSupplierName(supplierName);
            result.setExtractedItemsJson(jsonField(parsed, "items"));
            result.setExtractedFactsJson(jsonField(parsed, "facts"));
            result.setTotalWithoutVat(textValue(parsed.get("total_without_vat")));
            result.setTotalWithVat(textValue(parsed.get("total_with_vat")));
            result.setMissingFields(jsonOrTextValue(parsed.get("missing_fields")));
            result.setNotes(textValue(parsed.get("notes")));
            result.setIsComplete(parsed.has("is_complete") && parsed.get("is_complete").asBoolean(false));
            result.setSummary(null);
            result.setStandardChecksJson(null);
            result.setCriteriaEvaluationJson(null);

            ProcurementKpAnalysisDto saved = analysisService.saveOrUpdate(result);
            kpDocumentService.updateSupplierName(kpDocumentId, supplierName);
            return saved;
        } catch (Exception ex) {
            log.error("Failed to extract KP data for document {}", kpDocumentId, ex);
            ProcurementKpAnalysisDto failed = mergeWithExisting(kpDocumentId);
            failed.setSourceText(text);
            failed.setExtractionStatus(STATUS_FAILED);
            failed.setAnalysisStatus(STATUS_NOT_STARTED);
            failed.setExtractedAt(extractedAt);
            failed.setAnalyzedAt(null);
            failed.setSummary(null);
            failed.setStandardChecksJson(null);
            failed.setCriteriaEvaluationJson(null);
            failed.setNotes(ex.getMessage());
            analysisService.saveOrUpdate(failed);
            throw wrap("KP extraction failed", ex);
        }
    }

    public ProcurementKpAnalysisDto analyze(UUID kpDocumentId, String criteriaTextArg) {
        ProcurementKpDocumentDto document = requireDocument(kpDocumentId);
        ProcurementPackageDto packageDto = requirePackage(document.getPackageId());
        ProcurementKpAnalysisDto existing = analysisService.findByKpDocumentId(kpDocumentId);

        if (existing == null || !STATUS_COMPLETED.equals(existing.getExtractionStatus())) {
            throw new IllegalStateException("KP extraction must be completed before analysis");
        }

        JsonNode extractedFacts = parseRequiredJson(existing.getExtractedFactsJson(), "extracted facts");
        JsonNode extractedItems = parseOptionalJson(existing.getExtractedItemsJson());
        String criteriaText = criteriaTextArg;
        if (criteriaText == null || criteriaText.isBlank()) {
            criteriaText = packageDto.getCriteriaText();
        }

        List<ProcurementItemDto> lotItems = itemService.listByPackageId(document.getPackageId());
        OffsetDateTime analyzedAt = OffsetDateTime.now();

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("extraction", toSerializable(extractedFacts));
            payload.put("items", extractedItems != null && extractedItems.isArray()
                ? toSerializable(extractedItems)
                : List.of());
            payload.put("lot_items", lotItems.stream().map(this::toLotItemPayload).toList());
            payload.put("criteria_text", criteriaText);
            payload.put("supplier_name", existing.getSupplierName());
            payload.put("total_without_vat", existing.getTotalWithoutVat());
            payload.put("total_with_vat", existing.getTotalWithVat());

            ParsedN8nResponse response = procurementN8nHelper.post("/webhook/procurement/analyze-kp", payload);
            JsonNode parsed = response.parsed();
            if (parsed == null || !parsed.isObject()) {
                throw new IllegalStateException("KP analysis returned empty or invalid response");
            }

            ProcurementKpAnalysisDto result = mergeWithExisting(kpDocumentId);
            result.setAnalysisStatus(STATUS_COMPLETED);
            result.setAnalyzedAt(analyzedAt);
            result.setSummary(textValue(parsed.get("summary")));
            result.setStandardChecksJson(jsonField(parsed, "standard_checks"));
            result.setCriteriaEvaluationJson(jsonField(parsed, "criteria_evaluation"));
            result.setMissingFields(jsonOrTextValue(parsed.get("missing_fields")));
            result.setNotes(textValue(parsed.get("notes")));
            result.setSupplierName(firstNonBlank(
                textValue(parsed.get("supplier_name")),
                existing.getSupplierName()));
            result.setIsComplete(parsed.has("is_complete")
                ? parsed.get("is_complete").asBoolean(false)
                : Boolean.TRUE.equals(existing.getIsComplete()));

            ProcurementKpAnalysisDto saved = analysisService.saveOrUpdate(result);
            kpDocumentService.updateSupplierName(kpDocumentId, saved.getSupplierName());
            return saved;
        } catch (Exception ex) {
            log.error("Failed to analyze KP document {}", kpDocumentId, ex);
            ProcurementKpAnalysisDto failed = mergeWithExisting(kpDocumentId);
            failed.setAnalysisStatus(STATUS_FAILED);
            failed.setAnalyzedAt(analyzedAt);
            failed.setNotes(ex.getMessage());
            analysisService.saveOrUpdate(failed);
            throw wrap("KP analysis failed", ex);
        }
    }

    private ProcurementKpAnalysisDto mergeWithExisting(UUID kpDocumentId) {
        ProcurementKpAnalysisDto existing = analysisService.findByKpDocumentId(kpDocumentId);
        if (existing != null) {
            return existing;
        }

        ProcurementKpAnalysisDto created = new ProcurementKpAnalysisDto();
        created.setKpDocumentId(kpDocumentId);
        created.setExtractionStatus(STATUS_NOT_STARTED);
        created.setAnalysisStatus(STATUS_NOT_STARTED);
        return created;
    }

    private ProcurementKpDocumentDto requireDocument(UUID kpDocumentId) {
        ProcurementKpDocumentDto document = kpDocumentService.get(kpDocumentId);
        if (document == null) {
            throw new IllegalStateException("KP document not found: " + kpDocumentId);
        }
        return document;
    }

    private ProcurementPackageDto requirePackage(UUID packageId) {
        ProcurementPackageDto packageDto = packageService.get(packageId);
        if (packageDto == null) {
            throw new IllegalStateException("Procurement package not found: " + packageId);
        }
        return packageDto;
    }

    private String readDocumentText(ProcurementKpDocumentDto document) {
        FileStorageResponse file = fileStorageService.get(document.getFileId());
        if (file == null || file.getFilePath() == null || file.getFilePath().isBlank()) {
            throw new IllegalStateException("KP file not found in file storage: " + document.getFileId());
        }

        Path kpFilePath = resolveFilePath(file);
        return ocrService.extractText(kpFilePath);
    }

    private JsonNode parseRequiredJson(String value, String description) {
        JsonNode parsed = parseOptionalJson(value);
        if (parsed == null) {
            throw new IllegalStateException("KP " + description + " are missing");
        }
        return parsed;
    }

    private JsonNode parseOptionalJson(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        JsonNode parsed = procurementN8nHelper.tryParseJson(value);
        if (parsed != null) {
            return parsed;
        }

        try {
            return OBJECT_MAPPER.readTree(value);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to parse saved KP JSON", ex);
        }
    }

    private Map<String, Object> toLotItemPayload(ProcurementItemDto item) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", item.getId());
        payload.put("name", item.getName());
        payload.put("specs", item.getSpecs());
        payload.put("qty", item.getQty());
        payload.put("unit", item.getUnit());
        return payload;
    }

    private Object toSerializable(JsonNode node) {
        return OBJECT_MAPPER.convertValue(node, Object.class);
    }

    private String jsonField(JsonNode parsed, String fieldName) {
        JsonNode node = parsed.get(fieldName);
        if (node == null || node.isNull()) {
            return null;
        }
        return node.toString();
    }

    private String jsonOrTextValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return node.isTextual() ? node.asText() : node.toString();
    }

    private String textValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }

        String value = node.asText();
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }

    private IllegalStateException wrap(String message, Exception ex) {
        if (ex instanceof IllegalStateException stateException) {
            return stateException;
        }
        return new IllegalStateException(message, ex);
    }

    private Path resolveFilePath(FileStorageResponse file) {
        Path filePath = Paths.get(file.getFilePath()).normalize();
        if (filePath.isAbsolute() && Files.exists(filePath)) {
            return filePath;
        }

        Path resolvedPath = fileStorageRoot.resolve(filePath).normalize();
        if (Files.exists(resolvedPath)) {
            return resolvedPath;
        }

        throw new IllegalStateException(
            "KP file not found in storage root: " + resolvedPath + " (source path: " + file.getFilePath() + ")");
    }

    private Path resolveStorageRoot() {
        String location = System.getProperty("file.storage.location");
        if (location == null || location.isBlank()) {
            location = System.getenv("FILE_STORAGE_LOCATION");
        }
        if (location == null || location.isBlank()) {
            location = "./data/files";
        }
        return Paths.get(location).normalize();
    }
}
