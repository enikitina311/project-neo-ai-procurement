package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItemService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.response.ProcurementItemDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysisService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response.ProcurementKpAnalysisDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocumentService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.response.ProcurementKpDocumentDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.ProcurementNmcResultService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.response.ProcurementNmcResultDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplierService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.response.ProcurementSupplierDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;

@ExtendWith(MockitoExtension.class)
class ProcurementNmcWorkflowTest {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Mock
    private ProcurementItemService itemService;

    @Mock
    private ProcurementSupplierService supplierService;

    @Mock
    private ProcurementKpDocumentService kpDocumentService;

    @Mock
    private ProcurementKpAnalysisService kpAnalysisService;

    @Mock
    private ProcurementNmcResultService nmcResultService;

    @Mock
    private ProcurementN8nHelper procurementN8nHelper;

    private ProcurementNmcWorkflow workflow;

    @BeforeEach
    void setUp() {
        workflow = new ProcurementNmcWorkflow(
            itemService,
            supplierService,
            kpDocumentService,
            kpAnalysisService,
            nmcResultService,
            procurementN8nHelper);
    }

    @Test
    void generateShouldUseOnlyAnalyzedOffersAndPersistParsedResponse() {
        UUID packageId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();
        UUID analyzedDocumentId = UUID.randomUUID();

        ProcurementItemDto itemDto = new ProcurementItemDto();
        itemDto.setName("Pump");

        ProcurementSupplierDto supplierDto = new ProcurementSupplierDto();
        supplierDto.setId(supplierId);
        supplierDto.setName("Acme");

        ProcurementKpDocumentDto analyzedDocument = new ProcurementKpDocumentDto();
        analyzedDocument.setId(analyzedDocumentId);
        analyzedDocument.setSupplierId(supplierId);

        ProcurementKpDocumentDto skippedDocument = new ProcurementKpDocumentDto();
        skippedDocument.setId(UUID.randomUUID());
        skippedDocument.setSupplierId(UUID.randomUUID());

        ProcurementKpAnalysisDto analyzedOffer = new ProcurementKpAnalysisDto();
        analyzedOffer.setExtractedItemsJson("[{\"name\":\"Pump\",\"price\":100}]");

        ObjectNode parsed = OBJECT_MAPPER.createObjectNode();
        parsed.put("table", "NMC table");
        parsed.put("currency", "RUB");

        when(itemService.listByPackageId(packageId)).thenReturn(List.of(itemDto));
        when(supplierService.listByPackageId(packageId)).thenReturn(List.of(supplierDto));
        when(kpDocumentService.listByPackageId(packageId)).thenReturn(List.of(analyzedDocument, skippedDocument));
        when(kpAnalysisService.findByKpDocumentId(analyzedDocumentId)).thenReturn(analyzedOffer);
        when(kpAnalysisService.findByKpDocumentId(skippedDocument.getId())).thenReturn(null);
        when(procurementN8nHelper.post(eq("/webhook/procurement/nmc"), anyMap()))
            .thenReturn(new ProcurementN8nHelper.ParsedN8nResponse(parsed.toString(), parsed));
        when(nmcResultService.saveOrUpdate(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ProcurementNmcResultDto result = workflow.generate(packageId);

        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        verify(procurementN8nHelper).post(eq("/webhook/procurement/nmc"), payloadCaptor.capture());

        Map<String, Object> payload = payloadCaptor.getValue();
        assertThat((List<?>) payload.get("items")).hasSize(1);
        assertThat((List<?>) payload.get("offers")).hasSize(1);
        Map<?, ?> offer = (Map<?, ?>) ((List<?>) payload.get("offers")).get(0);
        assertThat(offer.get("supplierId")).isEqualTo(supplierId);
        assertThat(offer.get("supplierName")).isEqualTo("Acme");
        assertThat(offer.get("items")).isEqualTo("[{\"name\":\"Pump\",\"price\":100}]");
        assertThat(result.getPackageId()).isEqualTo(packageId);
        assertThat(result.getNmcTableJson()).isEqualTo(parsed.toString());
        assertThat(result.getNmcTableText()).isEqualTo("NMC table");
    }
}
