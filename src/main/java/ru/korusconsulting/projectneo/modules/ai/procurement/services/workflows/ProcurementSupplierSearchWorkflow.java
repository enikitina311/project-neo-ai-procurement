package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CancellationException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItemService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.response.ProcurementItemDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliersearch.ProcurementSupplierSearchRunModel;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliersearch.ProcurementSupplierSearchRunService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliersearch.ProcurementSupplierSearchRunStatus;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nAsyncClient;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nExecutionClient;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper.ParsedN8nResponse;

@Service
@Slf4j
public class ProcurementSupplierSearchWorkflow {
    private static final double DEFAULT_COVERAGE_THRESHOLD = 0.7;
    private static final int DEFAULT_SUPPLIERS_LIMIT = 10;
    private static final long EXECUTION_DISCOVERY_TIMEOUT_MS = 20_000L;
    private static final long EXECUTION_DISCOVERY_POLL_INTERVAL_MS = 400L;
    private static final long CANCEL_COMPLETION_WAIT_MS = 5_000L;

    private final ProcurementItemService itemService;
    private final ProcurementPackageService packageService;
    private final ProcurementN8nHelper procurementN8nHelper;
    private final ProcurementN8nAsyncClient procurementN8nAsyncClient;
    private final ProcurementN8nExecutionClient procurementN8nExecutionClient;
    private final ProcurementSupplierSearchRunService searchRunService;
    private final ExecutorService searchExecutor;
    private final ConcurrentMap<UUID, ActiveSearchExecution> activeSearches = new ConcurrentHashMap<>();

    @Autowired
    public ProcurementSupplierSearchWorkflow(
            ProcurementItemService itemService,
            ProcurementPackageService packageService,
            ProcurementN8nHelper procurementN8nHelper,
            ProcurementN8nAsyncClient procurementN8nAsyncClient,
            ProcurementN8nExecutionClient procurementN8nExecutionClient,
            ProcurementSupplierSearchRunService searchRunService) {
        this.itemService = itemService;
        this.packageService = packageService;
        this.procurementN8nHelper = procurementN8nHelper;
        this.procurementN8nAsyncClient = procurementN8nAsyncClient;
        this.procurementN8nExecutionClient = procurementN8nExecutionClient;
        this.searchRunService = searchRunService;
        this.searchExecutor = Executors.newCachedThreadPool(runnable -> {
            Thread thread = new Thread(runnable, "procurement-supplier-search");
            thread.setDaemon(true);
            return thread;
        });
    }

    public Map<String, Object> searchByPackage(UUID packageId, String query) {
        return toSyncResponse(executePackageSearch(buildPackagePayload(packageId, query, null)));
    }

    public Map<String, Object> searchByItem(String itemName) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("item", itemName);

        return toSyncResponse(executePackageSearch(payload));
    }

    public Map<String, Object> startSearchByPackage(UUID packageId, String query, UUID userId) {
        if (userId == null) {
            throw new IllegalStateException("Current user is not available for supplier search");
        }

        String correlationToken = UUID.randomUUID().toString();
        Map<String, Object> payload = buildPackagePayload(packageId, query, correlationToken);
        ProcurementSupplierSearchRunModel searchRun = searchRunService.create(packageId, query, payload, userId);

        ActiveSearchExecution activeExecution = new ActiveSearchExecution();
        activeSearches.put(searchRun.getId(), activeExecution);
        searchExecutor.submit(() ->
            executeAsyncSearch(searchRun.getId(), payload, correlationToken, searchRun.getCreatedBy(), activeExecution));

        return toSearchStatusResponse(searchRun);
    }

    public Map<String, Object> getSearchStatus(UUID searchRunId) {
        return toSearchStatusResponse(searchRunService.get(searchRunId));
    }

    public Map<String, Object> cancelSearch(UUID searchRunId, UUID userId) {
        ProcurementSupplierSearchRunModel current = searchRunService.get(searchRunId);
        ProcurementSupplierSearchRunStatus currentStatus = searchRunService.statusOf(current);
        if (currentStatus.isTerminal()) {
            return toSearchStatusResponse(current);
        }

        UUID auditUserId = userId != null ? userId : current.getCreatedBy();
        ProcurementSupplierSearchRunModel updated = searchRunService.markCancelRequested(searchRunId, auditUserId);

        ActiveSearchExecution activeExecution = activeSearches.get(searchRunId);
        if (activeExecution != null) {
            activeExecution.requestCancel();
            if (activeExecution.tryStopN8nExecution(procurementN8nExecutionClient)) {
                updated = searchRunService.markCancelled(searchRunId, auditUserId);
            }
        } else if (current.getN8nExecutionId() != null
            && procurementN8nExecutionClient.stopExecution(current.getN8nExecutionId())) {
            updated = searchRunService.markCancelled(searchRunId, auditUserId);
        } else {
            updated = searchRunService.markCancelled(searchRunId, auditUserId);
        }

        return toSearchStatusResponse(updated);
    }

    @PreDestroy
    public void shutdown() {
        activeSearches.values().forEach(ActiveSearchExecution::requestCancel);
        searchExecutor.shutdownNow();
    }

    private ParsedN8nResponse executePackageSearch(Map<String, Object> payload) {
        ParsedN8nResponse response = procurementN8nHelper.post("/webhook/procurement/web-price", payload);
        JsonNode parsed = procurementN8nHelper.normalizeArrayField(response.parsed(), "suppliers");
        return new ParsedN8nResponse(response.output(), parsed);
    }

    private Map<String, Object> toSyncResponse(ParsedN8nResponse response) {
        Map<String, Object> result = new HashMap<>();
        result.put("raw", response.output());
        result.put("parsed", response.parsed());
        return result;
    }

    private Map<String, Object> buildPackagePayload(UUID packageId, String query, String correlationToken) {
        ProcurementPackageDto procurementPackage = packageService.get(packageId);
        if (procurementPackage == null) {
            throw new IllegalStateException("Procurement package not found: " + packageId);
        }

        List<ProcurementItemDto> items = itemService.listByPackageId(packageId);
        Map<String, Object> payload = new HashMap<>();
        payload.put("packageId", packageId.toString());
        payload.put("coverageThreshold", procurementPackage.getCoverageThreshold() != null
            ? procurementPackage.getCoverageThreshold()
            : DEFAULT_COVERAGE_THRESHOLD);
        payload.put("suppliersLimit", procurementPackage.getSuppliersLimit() != null
            ? procurementPackage.getSuppliersLimit()
            : DEFAULT_SUPPLIERS_LIMIT);
        if (query != null && !query.isBlank()) {
            payload.put("query", query);
        }
        if (correlationToken != null && !correlationToken.isBlank()) {
            payload.put("_neoSearchRunId", correlationToken);
        }

        List<Map<String, Object>> itemPayloads = items.stream()
            .map(item -> {
                Map<String, Object> entry = new HashMap<>();
                entry.put("name", item.getName());
                return entry;
            })
            .toList();
        payload.put("items", itemPayloads);
        return payload;
    }

    private void executeAsyncSearch(
            UUID searchRunId,
            Map<String, Object> payload,
            String correlationToken,
            UUID userId,
            ActiveSearchExecution activeExecution) {
        try {
            ProcurementSupplierSearchRunModel current = searchRunService.markRunning(searchRunId, userId);
            if (Boolean.TRUE.equals(current.getCancelRequested())) {
                searchRunService.markCancelled(searchRunId, userId);
                return;
            }

            CompletableFuture<ParsedN8nResponse> requestFuture =
                procurementN8nAsyncClient.post("/webhook/procurement/web-price", payload);
            activeExecution.setRequestFuture(requestFuture);

            if (activeExecution.isCancelRequested()) {
                if (!activeExecution.hasExecutionId()) {
                    waitForPendingExecutionAfterCancel(searchRunId, correlationToken, userId, activeExecution, requestFuture);
                }
                activeExecution.tryStopN8nExecution(procurementN8nExecutionClient);
                try {
                    requestFuture.get(CANCEL_COMPLETION_WAIT_MS, TimeUnit.MILLISECONDS);
                } catch (CancellationException | TimeoutException ignored) {
                    // cancellation is handled below
                    activeExecution.forceCancelRequestFuture();
                }
                searchRunService.markCancelled(searchRunId, userId);
                return;
            }

            ParsedN8nResponse response = requestFuture.join();
            ProcurementSupplierSearchRunModel latest = searchRunService.get(searchRunId);
            if (Boolean.TRUE.equals(latest.getCancelRequested()) || activeExecution.isCancelRequested()) {
                searchRunService.markCancelled(searchRunId, userId);
                return;
            }

            JsonNode normalized = procurementN8nHelper.normalizeArrayField(response.parsed(), "suppliers");
            searchRunService.markCompleted(searchRunId, response.output(), normalized, userId);
        } catch (CancellationException ex) {
            log.info("Supplier search {} cancelled", searchRunId);
            searchRunService.markCancelled(searchRunId, userId);
        } catch (Exception ex) {
            if (activeExecution.isCancelRequested()) {
                log.info("Supplier search {} interrupted", searchRunId);
                searchRunService.markCancelled(searchRunId, userId);
                return;
            }

            log.error("Supplier search {} failed", searchRunId, ex);
            searchRunService.markFailed(searchRunId, ex.getMessage(), userId);
        } finally {
            activeSearches.remove(searchRunId);
        }
    }

    private void resolveExecutionId(
            UUID searchRunId,
            String correlationToken,
            UUID userId,
            ActiveSearchExecution activeExecution,
            CompletableFuture<ParsedN8nResponse> requestFuture) throws InterruptedException {
        long deadline = System.currentTimeMillis() + EXECUTION_DISCOVERY_TIMEOUT_MS;

        while (!requestFuture.isDone()
            && !activeExecution.hasExecutionId()
            && System.currentTimeMillis() < deadline) {
            procurementN8nExecutionClient.findRunningExecutionIdByToken(correlationToken)
                .ifPresent(executionId -> attachExecutionId(searchRunId, userId, activeExecution, executionId));

            if (activeExecution.isCancelRequested()) {
                activeExecution.tryStopN8nExecution(procurementN8nExecutionClient);
                if (activeExecution.isStopRequested()) {
                    return;
                }
            }

            Thread.sleep(EXECUTION_DISCOVERY_POLL_INTERVAL_MS);
        }
    }

    private void waitForPendingExecutionAfterCancel(
            UUID searchRunId,
            String correlationToken,
            UUID userId,
            ActiveSearchExecution activeExecution,
            CompletableFuture<ParsedN8nResponse> requestFuture) throws InterruptedException {
        long deadline = System.currentTimeMillis() + EXECUTION_DISCOVERY_TIMEOUT_MS;

        while (!requestFuture.isDone()
            && !activeExecution.hasExecutionId()
            && System.currentTimeMillis() < deadline) {
            procurementN8nExecutionClient.findRunningExecutionIdByToken(correlationToken)
                .ifPresent(executionId -> attachExecutionId(searchRunId, userId, activeExecution, executionId));

            if (activeExecution.tryStopN8nExecution(procurementN8nExecutionClient)) {
                return;
            }

            Thread.sleep(EXECUTION_DISCOVERY_POLL_INTERVAL_MS);
        }
    }

    private void attachExecutionId(
            UUID searchRunId,
            UUID userId,
            ActiveSearchExecution activeExecution,
            String executionId) {
        if (executionId == null || executionId.isBlank()) {
            return;
        }
        if (activeExecution.registerExecutionId(executionId)) {
            searchRunService.setN8nExecutionId(searchRunId, executionId, userId);
            log.info("Bound supplier search {} to n8n execution {}", searchRunId, executionId);
        }
    }

    private Map<String, Object> toSearchStatusResponse(ProcurementSupplierSearchRunModel searchRun) {
        Map<String, Object> result = new HashMap<>();
        result.put("searchRunId", searchRun.getId());
        result.put("status", searchRun.getStatus());
        result.put("raw", searchRun.getResultRaw());
        result.put("parsed", procurementN8nHelper.tryParseJson(searchRun.getResultParsedJson()));
        result.put("error", searchRun.getErrorText());
        return result;
    }

    private static final class ActiveSearchExecution {
        private volatile CompletableFuture<ParsedN8nResponse> requestFuture;
        private volatile boolean cancelRequested;
        private volatile boolean stopRequested;
        private volatile String executionId;

        public void setRequestFuture(CompletableFuture<ParsedN8nResponse> requestFuture) {
            this.requestFuture = requestFuture;
        }

        public boolean registerExecutionId(String executionId) {
            if (this.executionId != null) {
                return false;
            }
            this.executionId = executionId;
            return true;
        }

        public boolean hasExecutionId() {
            return this.executionId != null && !this.executionId.isBlank();
        }

        public boolean isCancelRequested() {
            return cancelRequested;
        }

        public boolean isStopRequested() {
            return stopRequested;
        }

        public void requestCancel() {
            this.cancelRequested = true;
        }

        public boolean tryStopN8nExecution(ProcurementN8nExecutionClient executionClient) {
            if (!cancelRequested || stopRequested || !hasExecutionId()) {
                return false;
            }

            stopRequested = executionClient.stopExecution(executionId);
            if (stopRequested) {
                CompletableFuture<ParsedN8nResponse> currentRequestFuture = this.requestFuture;
                if (currentRequestFuture != null) {
                    currentRequestFuture.cancel(true);
                }
            }

            return stopRequested;
        }

        public void forceCancelRequestFuture() {
            CompletableFuture<ParsedN8nResponse> currentRequestFuture = this.requestFuture;
            if (currentRequestFuture != null) {
                currentRequestFuture.cancel(true);
            }
        }
    }
}
