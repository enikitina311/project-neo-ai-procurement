package ru.korusconsulting.projectneo.modules.ai.procurement.services.support;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import ru.korusconsulting.projectneo.core.services.n8n.N8nService;

@ExtendWith(MockitoExtension.class)
class ProcurementN8nHelperTest {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Mock
    private N8nService n8nService;

    private ProcurementN8nHelper procurementN8nHelper;

    @BeforeEach
    void setUp() {
        procurementN8nHelper = new ProcurementN8nHelper(n8nService);
    }

    @Test
    void postShouldParseJsonWrappedInCodeFence() {
        ObjectNode response = OBJECT_MAPPER.createObjectNode();
        response.put("output", """
            ```json
            {"suppliers":[{"name":"Acme"}]}
            ```
            """);

        when(n8nService.post(eq("/webhook/procurement/web-price"), anyMap())).thenReturn(response);

        ProcurementN8nHelper.ParsedN8nResponse result = procurementN8nHelper.post(
            "/webhook/procurement/web-price",
            java.util.Map.of("query", "steel"));

        assertThat(result.output()).contains("suppliers");
        assertThat(result.parsed()).isNotNull();
        assertThat(result.parsed().path("suppliers").isArray()).isTrue();
        assertThat(result.parsed().path("suppliers").size()).isEqualTo(1);
        assertThat(result.parsed().path("suppliers").get(0).path("name").asText()).isEqualTo("Acme");
    }

    @Test
    void normalizeArrayFieldShouldParseEmbeddedJsonArrayString() {
        ObjectNode parsed = OBJECT_MAPPER.createObjectNode();
        parsed.put("suppliers", "[{\"name\":\"Acme\"},{\"name\":\"Beta\"}]");

        var normalized = procurementN8nHelper.normalizeArrayField(parsed, "suppliers");

        assertThat(normalized.path("suppliers").isArray()).isTrue();
        assertThat(normalized.path("suppliers").size()).isEqualTo(2);
        assertThat(normalized.path("suppliers").get(1).path("name").asText()).isEqualTo("Beta");
    }

    @Test
    void tryParseJsonShouldReturnNullForInvalidText() {
        assertThat(procurementN8nHelper.tryParseJson("not-json")).isNull();
    }
}
