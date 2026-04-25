package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliersearch.ProcurementSupplierSearchRunService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nAsyncClient;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nExecutionClient;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;

@ExtendWith(MockitoExtension.class)
class ProcurementSupplierSearchWorkflowTest {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Mock
    private ProcurementItemService itemService;

    @Mock
    private ProcurementPackageService packageService;

    @Mock
    private ProcurementN8nHelper procurementN8nHelper;

    @Mock
    private ProcurementN8nAsyncClient procurementN8nAsyncClient;

    @Mock
    private ProcurementN8nExecutionClient procurementN8nExecutionClient;

    @Mock
    private ProcurementSupplierSearchRunService procurementSupplierSearchRunService;

    private ProcurementSupplierSearchWorkflow workflow;

    @BeforeEach
    void setUp() {
        workflow = new ProcurementSupplierSearchWorkflow(
            itemService,
            packageService,
            procurementN8nHelper,
            procurementN8nAsyncClient,
            procurementN8nExecutionClient,
            procurementSupplierSearchRunService
        );
    }

    @Test
    void searchByPackageShouldBuildPayloadWithDefaultsAndNormalizedSuppliers() {
        UUID packageId = UUID.randomUUID();
        ProcurementPackageDto packageDto = new ProcurementPackageDto();

        ProcurementItemDto itemOne = new ProcurementItemDto();
        itemOne.setName("Metal beam");
        ProcurementItemDto itemTwo = new ProcurementItemDto();
        itemTwo.setName("Fastener");

        ObjectNode rawParsed = OBJECT_MAPPER.createObjectNode();
        rawParsed.put("suppliers", "[{\"name\":\"Acme\"}]");
        ObjectNode normalized = OBJECT_MAPPER.createObjectNode();
        normalized.set("suppliers", OBJECT_MAPPER.createArrayNode()
            .add(OBJECT_MAPPER.createObjectNode().put("name", "Acme")));

        when(packageService.get(packageId)).thenReturn(packageDto);
        when(itemService.listByPackageId(packageId)).thenReturn(List.of(itemOne, itemTwo));
        when(procurementN8nHelper.post(eq("/webhook/procurement/web-price"), anyMap()))
            .thenReturn(new ProcurementN8nHelper.ParsedN8nResponse("{\"suppliers\":[]}", rawParsed));
        when(procurementN8nHelper.normalizeArrayField(rawParsed, "suppliers")).thenReturn(normalized);

        Map<String, Object> result = workflow.searchByPackage(packageId, "metal");

        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        verify(procurementN8nHelper).post(eq("/webhook/procurement/web-price"), payloadCaptor.capture());

        Map<String, Object> payload = payloadCaptor.getValue();
        assertThat(payload.get("packageId")).isEqualTo(packageId.toString());
        assertThat(payload.get("coverageThreshold")).isEqualTo(0.7);
        assertThat(payload.get("suppliersLimit")).isEqualTo(10);
        assertThat(payload.get("query")).isEqualTo("metal");
        assertThat((List<?>) payload.get("items")).hasSize(2);
        assertThat(((Map<?, ?>) ((List<?>) payload.get("items")).get(0)).get("name")).isEqualTo("Metal beam");
        assertThat(result.get("raw")).isEqualTo("{\"suppliers\":[]}");
        assertThat(result.get("parsed")).isEqualTo(normalized);
    }

    @Test
    void searchByPackageShouldFailWhenPackageDoesNotExist() {
        UUID packageId = UUID.randomUUID();
        when(packageService.get(packageId)).thenReturn(null);

        assertThatThrownBy(() -> workflow.searchByPackage(packageId, null))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Procurement package not found");
    }
}
