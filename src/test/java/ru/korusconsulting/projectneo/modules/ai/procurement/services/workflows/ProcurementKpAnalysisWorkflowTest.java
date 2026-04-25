package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

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

@ExtendWith(MockitoExtension.class)
class ProcurementKpAnalysisWorkflowTest {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Mock
    private ProcurementKpDocumentService kpDocumentService;

    @Mock
    private ProcurementPackageService packageService;

    @Mock
    private ProcurementItemService itemService;

    @Mock
    private ProcurementKpAnalysisService analysisService;

    @Mock
    private ProcurementOcrService ocrService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private ProcurementN8nHelper procurementN8nHelper;

    private ProcurementKpAnalysisWorkflow workflow;

    @BeforeEach
    void setUp() {
        workflow = new ProcurementKpAnalysisWorkflow(
            kpDocumentService,
            packageService,
            itemService,
            analysisService,
            ocrService,
            fileStorageService,
            procurementN8nHelper);
    }

    @Test
    void extractShouldPersistStructuredFactsAndResetAnalysisPart() throws IOException {
        UUID kpDocumentId = UUID.randomUUID();
        UUID packageId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();

        ProcurementKpDocumentDto document = new ProcurementKpDocumentDto();
        document.setId(kpDocumentId);
        document.setPackageId(packageId);
        document.setFileId(fileId);

        ProcurementPackageDto packageDto = new ProcurementPackageDto();
        packageDto.setId(packageId);

        Path tempFile = Files.createTempFile("kp-offer-", ".pdf");

        FileStorageResponse fileResponse = new FileStorageResponse();
        fileResponse.setFilePath(tempFile.toString());

        ObjectNode parsed = OBJECT_MAPPER.createObjectNode();
        parsed.put("supplier_name", "ООО Ромашка");
        parsed.put("total_without_vat", "10000");
        parsed.put("total_with_vat", "12000");
        parsed.put("is_complete", false);
        parsed.put("notes", "НДС по строкам указан не везде");
        parsed.set("items", OBJECT_MAPPER.createArrayNode()
            .add(OBJECT_MAPPER.createObjectNode().put("name", "Pump")));
        parsed.set("facts", OBJECT_MAPPER.createObjectNode()
            .put("supplier_requisites", "ООО Ромашка, ИНН 1234567890"));
        parsed.set("missing_fields", OBJECT_MAPPER.createArrayNode().add("vat_percent"));

        when(kpDocumentService.get(kpDocumentId)).thenReturn(document);
        when(packageService.get(packageId)).thenReturn(packageDto);
        when(fileStorageService.get(fileId)).thenReturn(fileResponse);
        when(ocrService.extractText(tempFile)).thenReturn("Offer text");
        when(procurementN8nHelper.post(eq("/webhook/procurement/extract-kp"), anyMap()))
            .thenReturn(new ProcurementN8nHelper.ParsedN8nResponse(parsed.toString(), parsed));
        when(analysisService.findByKpDocumentId(kpDocumentId)).thenReturn(null);
        when(analysisService.saveOrUpdate(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ProcurementKpAnalysisDto result = workflow.extract(kpDocumentId);

        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        verify(procurementN8nHelper).post(eq("/webhook/procurement/extract-kp"), payloadCaptor.capture());

        Map<String, Object> payload = payloadCaptor.getValue();
        assertThat(((Map<?, ?>) payload.get("offer")).get("text")).isEqualTo("Offer text");
        assertThat(result.getKpDocumentId()).isEqualTo(kpDocumentId);
        assertThat(result.getSourceText()).isEqualTo("Offer text");
        assertThat(result.getExtractionStatus()).isEqualTo("completed");
        assertThat(result.getAnalysisStatus()).isEqualTo("not_started");
        assertThat(result.getSupplierName()).isEqualTo("ООО Ромашка");
        assertThat(result.getTotalWithoutVat()).isEqualTo("10000");
        assertThat(result.getTotalWithVat()).isEqualTo("12000");
        assertThat(result.getExtractedItemsJson()).contains("Pump");
        assertThat(result.getExtractedFactsJson()).contains("ИНН");
        assertThat(result.getSummary()).isNull();
        assertThat(result.getStandardChecksJson()).isNull();
        assertThat(result.getCriteriaEvaluationJson()).isNull();
    }

    @Test
    void analyzeShouldUseSavedExtractionAndLotItems() {
        UUID kpDocumentId = UUID.randomUUID();
        UUID packageId = UUID.randomUUID();

        ProcurementKpDocumentDto document = new ProcurementKpDocumentDto();
        document.setId(kpDocumentId);
        document.setPackageId(packageId);

        ProcurementPackageDto packageDto = new ProcurementPackageDto();
        packageDto.setId(packageId);
        packageDto.setCriteriaText("указаны реквизиты поставщика");

        ProcurementItemDto lotItem = new ProcurementItemDto();
        lotItem.setName("Дверь");
        lotItem.setQty(2d);
        lotItem.setUnit("шт");
        lotItem.setSpecs("Белая");

        ProcurementKpAnalysisDto existing = new ProcurementKpAnalysisDto();
        existing.setKpDocumentId(kpDocumentId);
        existing.setExtractionStatus("completed");
        existing.setAnalysisStatus("not_started");
        existing.setSupplierName("ООО Альянс");
        existing.setTotalWithoutVat("10000");
        existing.setTotalWithVat("12000");
        existing.setExtractedItemsJson("[{\"name\":\"Дверь\",\"qty\":\"2\",\"unit\":\"шт\"}]");
        existing.setExtractedFactsJson("{\"supplier_requisites\":\"ООО Альянс, ИНН 1234567890\"}");

        ObjectNode parsed = OBJECT_MAPPER.createObjectNode();
        parsed.put("supplier_name", "ООО Альянс");
        parsed.put("summary", "Позиции присутствуют, математика требует проверки.");
        parsed.put("notes", "Проверить НДС");
        parsed.set("missing_fields", OBJECT_MAPPER.createArrayNode().add("vat_percent"));
        parsed.set("standard_checks", OBJECT_MAPPER.createArrayNode()
            .add(OBJECT_MAPPER.createObjectNode()
                .put("check", "Все позиции из лота есть в КП")
                .put("comment", "Запрошенная позиция найдена.")
                .put("evidence", "Дверь, 2 шт")));
        parsed.set("criteria_evaluation", OBJECT_MAPPER.createArrayNode()
            .add(OBJECT_MAPPER.createObjectNode()
                .put("criterion", "указаны реквизиты поставщика")
                .put("comment", "Реквизиты указаны.")
                .put("evidence", "ООО Альянс, ИНН 1234567890")));

        when(kpDocumentService.get(kpDocumentId)).thenReturn(document);
        when(packageService.get(packageId)).thenReturn(packageDto);
        when(itemService.listByPackageId(packageId)).thenReturn(List.of(lotItem));
        when(analysisService.findByKpDocumentId(kpDocumentId)).thenReturn(existing);
        when(procurementN8nHelper.post(eq("/webhook/procurement/analyze-kp"), anyMap()))
            .thenReturn(new ProcurementN8nHelper.ParsedN8nResponse(parsed.toString(), parsed));
        when(analysisService.saveOrUpdate(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ProcurementKpAnalysisDto result = workflow.analyze(kpDocumentId, null);

        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        verify(procurementN8nHelper).post(eq("/webhook/procurement/analyze-kp"), payloadCaptor.capture());

        Map<String, Object> payload = payloadCaptor.getValue();
        assertThat(payload.get("criteria_text")).isEqualTo("указаны реквизиты поставщика");
        assertThat(payload.get("supplier_name")).isEqualTo("ООО Альянс");
        assertThat(payload.get("total_without_vat")).isEqualTo("10000");
        assertThat(payload.get("total_with_vat")).isEqualTo("12000");
        assertThat(payload.get("lot_items")).isInstanceOf(List.class);
        assertThat(result.getAnalysisStatus()).isEqualTo("completed");
        assertThat(result.getSummary()).contains("математика");
        assertThat(result.getStandardChecksJson()).contains("Все позиции из лота есть в КП");
        assertThat(result.getCriteriaEvaluationJson()).contains("реквизиты");
        assertThat(result.getNotes()).isEqualTo("Проверить НДС");
    }

    @Test
    void analyzeShouldFailWhenExtractionIsMissing() {
        UUID kpDocumentId = UUID.randomUUID();
        UUID packageId = UUID.randomUUID();

        ProcurementKpDocumentDto document = new ProcurementKpDocumentDto();
        document.setId(kpDocumentId);
        document.setPackageId(packageId);

        ProcurementPackageDto packageDto = new ProcurementPackageDto();
        packageDto.setId(packageId);

        when(kpDocumentService.get(kpDocumentId)).thenReturn(document);
        when(packageService.get(packageId)).thenReturn(packageDto);
        when(analysisService.findByKpDocumentId(kpDocumentId)).thenReturn(null);

        assertThatThrownBy(() -> workflow.analyze(kpDocumentId, null))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("extraction must be completed");
    }
}
