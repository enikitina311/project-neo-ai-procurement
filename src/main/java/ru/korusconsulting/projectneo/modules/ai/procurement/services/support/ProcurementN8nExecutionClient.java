package ru.korusconsulting.projectneo.modules.ai.procurement.services.support;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;
import ru.korusconsulting.projectneo.core.common.utils.StringExtensions;
import ru.korusconsulting.projectneo.core.services.n8n.entities.N8nConfig;

@Service
@Slf4j
public class ProcurementN8nExecutionClient {
    private static final int DEFAULT_LIMIT = 50;

    private final ProcurementN8nConfigProvider configProvider;
    private final HttpClient httpClient;

    @Autowired
    public ProcurementN8nExecutionClient(ProcurementN8nConfigProvider configProvider) {
        this.configProvider = configProvider;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    public Optional<String> findRunningExecutionIdByToken(String correlationToken) {
        if (correlationToken == null || correlationToken.isBlank()) {
            return Optional.empty();
        }

        Optional<String> running = findExecutionIdByToken(correlationToken, "running");
        if (running.isPresent()) {
            return running;
        }

        return findExecutionIdByToken(correlationToken, "waiting");
    }

    public boolean stopExecution(String executionId) {
        if (executionId == null || executionId.isBlank()) {
            return false;
        }

        N8nConfig config = configProvider.loadConfig();
        if (StringExtensions.isNullOrEmpty(config.getApiKey())) {
            log.warn("n8n API key is not configured; cannot stop execution {}", executionId);
            return false;
        }

        HttpRequest request = baseRequest(config, "/api/v1/executions/" + executionId + "/stop")
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Stopped n8n execution {}", executionId);
                return true;
            }

            log.warn(
                "Failed to stop n8n execution {}: status={}, body={}",
                executionId,
                response.statusCode(),
                response.body()
            );
            return false;
        } catch (Exception ex) {
            log.error("Failed to stop n8n execution {}", executionId, ex);
            return false;
        }
    }

    private Optional<String> findExecutionIdByToken(String correlationToken, String status) {
        N8nConfig config = configProvider.loadConfig();
        if (StringExtensions.isNullOrEmpty(config.getApiKey())) {
            log.warn("n8n API key is not configured; cannot resolve execution id for supplier search");
            return Optional.empty();
        }

        String path = String.format(
            "/api/v1/executions?status=%s&includeData=true&limit=%d",
            status,
            DEFAULT_LIMIT
        );

        HttpRequest request = baseRequest(config, path)
            .GET()
            .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn(
                    "Failed to query n8n executions for status {}: status={}, body={}",
                    status,
                    response.statusCode(),
                    response.body()
                );
                return Optional.empty();
            }

            JsonNode responseJson = StringExtensions.fromJson(response.body(), JsonNode.class);
            JsonNode executions = responseJson != null ? responseJson.get("data") : null;
            if (executions == null || !executions.isArray()) {
                return Optional.empty();
            }

            for (JsonNode execution : executions) {
                if (execution != null && execution.toString().contains(correlationToken)) {
                    JsonNode idNode = execution.get("id");
                    if (idNode != null && !idNode.isNull()) {
                        return Optional.of(idNode.asText());
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Failed to resolve n8n execution id for supplier search", ex);
        }

        return Optional.empty();
    }

    private HttpRequest.Builder baseRequest(N8nConfig config, String path) {
        String host = config.getHost();
        if (StringExtensions.isNullOrEmpty(host)) {
            throw new IllegalStateException("Configuration 'N8NHostUrl' does not contain a valid host");
        }

        String normalizedHost = host.startsWith("http") ? host : "http://" + host;
        String normalizedPath = path.startsWith("/") ? path : "/" + path;

        return HttpRequest.newBuilder()
            .uri(URI.create(normalizedHost + normalizedPath))
            .timeout(resolveTimeout(config))
            .header("Accept", "application/json")
            .header("X-N8N-API-KEY", config.getApiKey());
    }

    private Duration resolveTimeout(N8nConfig config) {
        if (config.getTimeoutMs() != null && config.getTimeoutMs() > 0) {
            return Duration.ofMillis(config.getTimeoutMs());
        }
        return Duration.ofSeconds(30);
    }
}
