package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;
import ru.korusconsulting.projectneo.core.services.filestorage.FileStorageService;
import ru.korusconsulting.projectneo.core.services.filestorage.dto.response.FileStorageResponse;
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
    private final ProcurementKpDocumentService kpDocumentService;
    private final ProcurementPackageService packageService;
    private final ProcurementKpAnalysisService analysisService;
    private final ProcurementOcrService ocrService;
    private final FileStorageService fileStorageService;
    private final ProcurementN8nHelper procurementN8nHelper;

    @Autowired
    public ProcurementKpAnalysisWorkflow(
            ProcurementKpDocumentService kpDocumentService,
            ProcurementPackageService packageService,
            ProcurementKpAnalysisService analysisService,
            ProcurementOcrService ocrService,
            FileStorageService fileStorageService,
            ProcurementN8nHelper procurementN8nHelper) {
        this.kpDocumentService = kpDocumentService;
        this.packageService = packageService;
        this.analysisService = analysisService;
        this.ocrService = ocrService;
        this.fileStorageService = fileStorageService;
        this.procurementN8nHelper = procurementN8nHelper;
    }

    public ProcurementKpAnalysisDto analyze(UUID kpDocumentId, String criteriaTextArg) {
        ProcurementKpDocumentDto document = kpDocumentService.get(kpDocumentId);
        if (document == null) {
            throw new IllegalStateException("KP document not found: " + kpDocumentId);
        }

        ProcurementPackageDto packageDto = packageService.get(document.getPackageId());
        if (packageDto == null) {
            throw new IllegalStateException("Procurement package not found for KP document: " + document.getPackageId());
        }

        String criteriaText = criteriaTextArg;
        if (criteriaText == null || criteriaText.isBlank()) {
            criteriaText = packageDto.getCriteriaText();
        }

        FileStorageResponse file = fileStorageService.get(document.getFileId());
        if (file == null || file.getFilePath() == null || file.getFilePath().isBlank()) {
            throw new IllegalStateException("KP file not found in file storage: " + document.getFileId());
        }

        String text = ocrService.extractText(Path.of(file.getFilePath()));

        Map<String, Object> offer = new HashMap<>();
        offer.put("text", text);

        Map<String, Object> payload = new HashMap<>();
        payload.put("offer", offer);
        payload.put("criteria_text", criteriaText);

        ParsedN8nResponse response = procurementN8nHelper.post("/webhook/procurement/analyze-kp", payload);
        JsonNode parsed = response.parsed();

        ProcurementKpAnalysisDto result = new ProcurementKpAnalysisDto();
        result.setKpDocumentId(kpDocumentId);

        if (parsed != null) {
            result.setIsComplete(parsed.has("is_complete") && parsed.get("is_complete").asBoolean(false));
            result.setMissingFields(parsed.has("missing_fields")
                ? jsonOrTextValue(parsed.get("missing_fields"))
                : null);
            result.setExtractedItemsJson(parsed.has("items") ? parsed.get("items").toString() : null);
            result.setNotes(parsed.has("notes") ? parsed.get("notes").asText() : null);
        } else {
            result.setIsComplete(false);
            result.setNotes(response.output());
        }

        return analysisService.saveOrUpdate(result);
    }

    private String jsonOrTextValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }

        return node.isTextual() ? node.asText() : node.toString();
    }
}
