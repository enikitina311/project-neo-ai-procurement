package ru.korusconsulting.projectneo.modules.ai.procurement.services.support;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProcurementN8nAsyncClient {
    private final ProcurementN8nHelper procurementN8nHelper;
    private final ExecutorService executorService;

    @Autowired
    public ProcurementN8nAsyncClient(ProcurementN8nHelper procurementN8nHelper) {
        this.procurementN8nHelper = procurementN8nHelper;
        this.executorService = Executors.newCachedThreadPool(runnable -> {
            Thread thread = new Thread(runnable, "procurement-n8n-async");
            thread.setDaemon(true);
            return thread;
        });
    }

    public CompletableFuture<ProcurementN8nHelper.ParsedN8nResponse> post(
            String webhookPath,
            Map<String, Object> payload) {
        return CompletableFuture.supplyAsync(() -> {
            log.info("Starting async n8n request to {}", webhookPath);
            ProcurementN8nHelper.ParsedN8nResponse response = procurementN8nHelper.post(webhookPath, payload);
            log.info("Completed async n8n request to {}", webhookPath);
            return response;
        }, executorService);
    }

    @PreDestroy
    public void shutdown() {
        executorService.shutdownNow();
    }
}
