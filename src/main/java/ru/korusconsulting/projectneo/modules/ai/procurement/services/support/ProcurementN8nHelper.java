package ru.korusconsulting.projectneo.modules.ai.procurement.services.support;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.extern.slf4j.Slf4j;
import ru.korusconsulting.projectneo.core.common.utils.StringExtensions;
import ru.korusconsulting.projectneo.core.services.n8n.N8nService;

@Service
@Slf4j
public class ProcurementN8nHelper {
    private final N8nService n8nService;

    @Autowired
    public ProcurementN8nHelper(N8nService n8nService) {
        this.n8nService = n8nService;
    }

    public ParsedN8nResponse post(String webhookPath, Map<String, Object> payload) {
        JsonNode response = n8nService.post(webhookPath, payload);
        String output = extractOutput(response);
        JsonNode parsed = tryParseJson(output);

        if (parsed == null && output != null && !output.isBlank()) {
            log.warn("n8n response from {} could not be parsed as JSON", webhookPath);
        }

        return new ParsedN8nResponse(output, parsed);
    }

    public JsonNode normalizeArrayField(JsonNode parsed, String fieldName) {
        if (parsed == null || !parsed.isObject()) {
            return parsed;
        }

        JsonNode fieldNode = parsed.get(fieldName);
        if (fieldNode != null && fieldNode.isTextual()) {
            JsonNode parsedField = tryParseJson(fieldNode.asText());
            if (parsedField != null && parsedField.isArray()) {
                ((ObjectNode) parsed).set(fieldName, parsedField);
            }
        }

        return parsed;
    }

    public String extractOutput(JsonNode response) {
        if (response == null || response.isNull()) {
            return "";
        }

        if (response.has("output")) {
            JsonNode outputNode = response.get("output");
            return outputNode.isTextual() ? outputNode.asText() : outputNode.toString();
        }

        return response.toString();
    }

    public JsonNode tryParseJson(String value) {
        try {
            if (value == null || value.isBlank()) {
                return null;
            }
            return StringExtensions.fromJson(value, JsonNode.class);
        } catch (Exception ex) {
            String sanitized = sanitizeJsonLike(value);
            if (sanitized == null) {
                return null;
            }

            try {
                return StringExtensions.fromJson(sanitized, JsonNode.class);
            } catch (Exception nested) {
                return null;
            }
        }
    }

    private String sanitizeJsonLike(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            int lastFence = trimmed.lastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline) {
                trimmed = trimmed.substring(firstNewline + 1, lastFence).trim();
            }
        }

        if ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
            || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            try {
                String unescaped = StringExtensions.fromJson(trimmed, String.class);
                if (unescaped != null && !unescaped.isBlank()) {
                    trimmed = unescaped.trim();
                }
            } catch (Exception ignored) {
                // Keep the original value when the string is not valid JSON.
            }
        }

        int firstBrace = trimmed.indexOf('{');
        int lastBrace = trimmed.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            trimmed = trimmed.substring(firstBrace, lastBrace + 1).trim();
        }

        return trimmed.isEmpty() ? null : trimmed;
    }

    public record ParsedN8nResponse(String output, JsonNode parsed) {
    }
}
