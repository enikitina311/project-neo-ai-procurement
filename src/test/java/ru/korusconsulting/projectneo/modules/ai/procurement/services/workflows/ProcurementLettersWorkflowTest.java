package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.ProcurementLetterService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.request.ProcurementLetterDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.response.ProcurementLetterDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplierService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.response.ProcurementSupplierDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;

@ExtendWith(MockitoExtension.class)
class ProcurementLettersWorkflowTest {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Mock
    private ProcurementPackageService packageService;

    @Mock
    private ProcurementItemService itemService;

    @Mock
    private ProcurementSupplierService supplierService;

    @Mock
    private ProcurementLetterService letterService;

    @Mock
    private ProcurementN8nHelper procurementN8nHelper;

    private ProcurementLettersWorkflow workflow;

    @BeforeEach
    void setUp() {
        workflow = new ProcurementLettersWorkflow(
            packageService,
            itemService,
            supplierService,
            letterService,
            procurementN8nHelper);
    }

    @Test
    void generateShouldFallbackToAllSuppliersAndSkipUnresolvedDrafts() {
        UUID packageId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();

        ProcurementPackageDto packageDto = new ProcurementPackageDto();
        packageDto.setId(packageId);

        ProcurementItemDto itemDto = new ProcurementItemDto();
        itemDto.setName("Pump");

        ProcurementSupplierDto supplier = new ProcurementSupplierDto();
        supplier.setId(supplierId);
        supplier.setName("Acme");

        ObjectNode parsed = OBJECT_MAPPER.createObjectNode();
        parsed.set("drafts", OBJECT_MAPPER.createArrayNode()
            .add(OBJECT_MAPPER.createObjectNode()
                .put("supplierName", "Acme")
                .put("subject", "Offer request")
                .put("body", "Please send your quote"))
            .add(OBJECT_MAPPER.createObjectNode()
                .put("supplierName", "Unknown Supplier")
                .put("subject", "Skipped")
                .put("body", "This should not be saved")));

        when(packageService.get(packageId)).thenReturn(packageDto);
        when(itemService.listByPackageId(packageId)).thenReturn(List.of(itemDto));
        when(supplierService.listSelectedByPackageId(packageId)).thenReturn(List.of());
        when(supplierService.listByPackageId(packageId)).thenReturn(List.of(supplier));
        when(procurementN8nHelper.post(eq("/webhook/procurement/generate-letters"), anyMap()))
            .thenReturn(new ProcurementN8nHelper.ParsedN8nResponse(parsed.toString(), parsed));
        when(letterService.create(any())).thenAnswer(invocation -> {
            ProcurementLetterDtoRequest request = invocation.getArgument(0);
            ProcurementLetterDto dto = new ProcurementLetterDto();
            dto.setPackageId(request.getPackageId());
            dto.setSupplierId(request.getSupplierId());
            dto.setSubject(request.getSubject());
            dto.setBody(request.getBody());
            dto.setStatus(request.getStatus());
            return dto;
        });

        List<ProcurementLetterDto> result = workflow.generate(packageId);

        verify(letterService).deleteByPackageId(packageId);
        verify(supplierService).listByPackageId(packageId);

        ArgumentCaptor<ProcurementLetterDtoRequest> requestCaptor =
            ArgumentCaptor.forClass(ProcurementLetterDtoRequest.class);
        verify(letterService).create(requestCaptor.capture());

        ProcurementLetterDtoRequest request = requestCaptor.getValue();
        assertThat(request.getPackageId()).isEqualTo(packageId);
        assertThat(request.getSupplierId()).isEqualTo(supplierId);
        assertThat(request.getSubject()).isEqualTo("Offer request");
        assertThat(request.getBody()).isEqualTo("Please send your quote");
        assertThat(request.getStatus()).isEqualTo("draft");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSupplierId()).isEqualTo(supplierId);
    }
}
