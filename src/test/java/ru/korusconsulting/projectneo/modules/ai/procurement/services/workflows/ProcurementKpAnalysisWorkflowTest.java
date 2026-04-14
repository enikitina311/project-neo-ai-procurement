package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.file.Path;
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
            analysisService,
            ocrService,
            fileStorageService,
            procurementN8nHelper);
    }

    @Test
    void analyzeShouldUsePackageCriteriaAndPersistMappedResult() {
        UUID kpDocumentId = UUID.randomUUID();
        UUID packageId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();

        ProcurementKpDocumentDto document = new ProcurementKpDocumentDto();
        document.setId(kpDocumentId);
        document.setPackageId(packageId);
        document.setFileId(fileId);

        ProcurementPackageDto packageDto = new ProcurementPackageDto();
        packageDto.setId(packageId);
        packageDto.setCriteriaText("Required warranty");

        FileStorageResponse fileResponse = new FileStorageResponse();
        fileResponse.setFilePath("/tmp/kp-offer.pdf");

        ObjectNode parsed = OBJECT_MAPPER.createObjectNode();
        parsed.put("is_complete", true);
        parsed.put("missing_fields", "[\"delivery\"]");
        parsed.put("notes", "Offer is complete");
        parsed.set("items", OBJECT_MAPPER.createArrayNode()
            .add(OBJECT_MAPPER.createObjectNode().put("name", "Pump")));

        when(kpDocumentService.get(kpDocumentId)).thenReturn(document);
        when(packageService.get(packageId)).thenReturn(packageDto);
        when(fileStorageService.get(fileId)).thenReturn(fileResponse);
        when(ocrService.extractText(Path.of("/tmp/kp-offer.pdf"))).thenReturn("Offer text");
        when(procurementN8nHelper.post(eq("/webhook/procurement/analyze-kp"), anyMap()))
            .thenReturn(new ProcurementN8nHelper.ParsedN8nResponse(parsed.toString(), parsed));
        when(analysisService.saveOrUpdate(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ProcurementKpAnalysisDto result = workflow.analyze(kpDocumentId, null);

        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        verify(procurementN8nHelper).post(eq("/webhook/procurement/analyze-kp"), payloadCaptor.capture());

        Map<String, Object> payload = payloadCaptor.getValue();
        assertThat(payload.get("criteria_text")).isEqualTo("Required warranty");
        assertThat(((Map<?, ?>) payload.get("offer")).get("text")).isEqualTo("Offer text");
        assertThat(result.getKpDocumentId()).isEqualTo(kpDocumentId);
        assertThat(result.getIsComplete()).isTrue();
        assertThat(result.getMissingFields()).isEqualTo("[\"delivery\"]");
        assertThat(result.getNotes()).isEqualTo("Offer is complete");
        assertThat(result.getExtractedItemsJson()).contains("Pump");
    }

    @Test
    void analyzeShouldFailWhenFileIsMissingFromStorage() {
        UUID kpDocumentId = UUID.randomUUID();
        UUID packageId = UUID.randomUUID();

        ProcurementKpDocumentDto document = new ProcurementKpDocumentDto();
        document.setId(kpDocumentId);
        document.setPackageId(packageId);
        document.setFileId(UUID.randomUUID());

        ProcurementPackageDto packageDto = new ProcurementPackageDto();
        packageDto.setId(packageId);

        FileStorageResponse fileResponse = new FileStorageResponse();
        fileResponse.setFilePath(" ");

        when(kpDocumentService.get(kpDocumentId)).thenReturn(document);
        when(packageService.get(packageId)).thenReturn(packageDto);
        when(fileStorageService.get(document.getFileId())).thenReturn(fileResponse);

        assertThatThrownBy(() -> workflow.analyze(kpDocumentId, "criteria"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("KP file not found");
    }
}
