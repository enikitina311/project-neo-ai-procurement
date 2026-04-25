package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliersearch;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;

import ru.korusconsulting.projectneo.core.common.repositories.BaseRepository;
import ru.korusconsulting.projectneo.core.common.repositories.RepositoryFactory;
import ru.korusconsulting.projectneo.core.common.utils.StringExtensions;

@Service
@Transactional
public class ProcurementSupplierSearchRunService {
    private final BaseRepository<ProcurementSupplierSearchRunModel> repository;

    @Autowired
    public ProcurementSupplierSearchRunService(RepositoryFactory factory) {
        this.repository = factory.createRepository(ProcurementSupplierSearchRunModel.class);
    }

    public ProcurementSupplierSearchRunModel create(UUID packageId, String query, Map<String, Object> payload, UUID userId) {
        String normalizedQuery = normalizeBlank(query);
        String payloadJson = payload == null ? null : StringExtensions.toJson(payload, false);

        return repository.create(
            new String[] {
                "package_id",
                "query",
                "status",
                "request_payload_json::jsonb",
                "cancel_requested",
                "started_at",
                "created_by"
            },
            packageId,
            normalizedQuery,
            ProcurementSupplierSearchRunStatus.RUNNING.value(),
            payloadJson,
            false,
            OffsetDateTime.now(),
            userId
        ).orElseThrow(() -> new IllegalStateException("Failed to create supplier search run"));
    }

    @Transactional(readOnly = true)
    public ProcurementSupplierSearchRunModel get(UUID searchRunId) {
        return repository.getById(searchRunId);
    }

    @Transactional(readOnly = true)
    public Optional<ProcurementSupplierSearchRunModel> find(UUID searchRunId) {
        return repository.findById(searchRunId);
    }

    public ProcurementSupplierSearchRunModel markRunning(UUID searchRunId, UUID updatedBy) {
        ProcurementSupplierSearchRunModel current = get(searchRunId);
        if (statusOf(current).isTerminal() || Boolean.TRUE.equals(current.getCancelRequested())) {
            return current;
        }

        return update(
            searchRunId,
            updatedBy != null ? updatedBy : current.getCreatedBy(),
            new String[] { "status", "started_at", "updated_by" },
            ProcurementSupplierSearchRunStatus.RUNNING.value(),
            current.getStartedAt() != null ? current.getStartedAt() : OffsetDateTime.now(),
            updatedBy != null ? updatedBy : current.getCreatedBy()
        );
    }

    public ProcurementSupplierSearchRunModel markCancelRequested(UUID searchRunId, UUID updatedBy) {
        ProcurementSupplierSearchRunModel current = get(searchRunId);
        ProcurementSupplierSearchRunStatus status = statusOf(current);
        if (status.isTerminal() || status == ProcurementSupplierSearchRunStatus.CANCEL_REQUESTED) {
            return current;
        }

        return update(
            searchRunId,
            updatedBy != null ? updatedBy : current.getCreatedBy(),
            new String[] { "status", "cancel_requested", "updated_by" },
            ProcurementSupplierSearchRunStatus.CANCEL_REQUESTED.value(),
            true,
            updatedBy != null ? updatedBy : current.getCreatedBy()
        );
    }

    public ProcurementSupplierSearchRunModel setN8nExecutionId(UUID searchRunId, String executionId, UUID updatedBy) {
        ProcurementSupplierSearchRunModel current = get(searchRunId);
        String normalizedExecutionId = normalizeBlank(executionId);
        if (normalizedExecutionId == null) {
            return current;
        }
        if (normalizedExecutionId.equals(current.getN8nExecutionId())) {
            return current;
        }

        return update(
            searchRunId,
            updatedBy != null ? updatedBy : current.getCreatedBy(),
            new String[] { "n8n_execution_id", "updated_by" },
            normalizedExecutionId,
            updatedBy != null ? updatedBy : current.getCreatedBy()
        );
    }

    public ProcurementSupplierSearchRunModel markCompleted(
            UUID searchRunId,
            String raw,
            JsonNode parsed,
            UUID updatedBy) {
        ProcurementSupplierSearchRunModel current = get(searchRunId);
        ProcurementSupplierSearchRunStatus status = statusOf(current);
        if (status == ProcurementSupplierSearchRunStatus.CANCEL_REQUESTED
            || status == ProcurementSupplierSearchRunStatus.CANCELLED) {
            return current;
        }

        return update(
            searchRunId,
            updatedBy != null ? updatedBy : current.getCreatedBy(),
            new String[] {
                "status",
                "result_raw",
                "result_parsed_json::jsonb",
                "error_text",
                "finished_at",
                "updated_by"
            },
            ProcurementSupplierSearchRunStatus.COMPLETED.value(),
            normalizeBlank(raw),
            parsed != null ? parsed.toString() : null,
            null,
            OffsetDateTime.now(),
            updatedBy != null ? updatedBy : current.getCreatedBy()
        );
    }

    public ProcurementSupplierSearchRunModel markFailed(UUID searchRunId, String errorText, UUID updatedBy) {
        ProcurementSupplierSearchRunModel current = get(searchRunId);
        ProcurementSupplierSearchRunStatus status = statusOf(current);
        if (status == ProcurementSupplierSearchRunStatus.CANCEL_REQUESTED
            || status == ProcurementSupplierSearchRunStatus.CANCELLED) {
            return current;
        }

        return update(
            searchRunId,
            updatedBy != null ? updatedBy : current.getCreatedBy(),
            new String[] { "status", "error_text", "finished_at", "updated_by" },
            ProcurementSupplierSearchRunStatus.FAILED.value(),
            normalizeBlank(errorText),
            OffsetDateTime.now(),
            updatedBy != null ? updatedBy : current.getCreatedBy()
        );
    }

    public ProcurementSupplierSearchRunModel markCancelled(UUID searchRunId, UUID updatedBy) {
        ProcurementSupplierSearchRunModel current = get(searchRunId);
        ProcurementSupplierSearchRunStatus status = statusOf(current);
        if (status == ProcurementSupplierSearchRunStatus.CANCELLED) {
            return current;
        }
        if (status == ProcurementSupplierSearchRunStatus.COMPLETED
            || status == ProcurementSupplierSearchRunStatus.FAILED) {
            return current;
        }

        return update(
            searchRunId,
            updatedBy != null ? updatedBy : current.getCreatedBy(),
            new String[] { "status", "cancel_requested", "finished_at", "updated_by" },
            ProcurementSupplierSearchRunStatus.CANCELLED.value(),
            true,
            OffsetDateTime.now(),
            updatedBy != null ? updatedBy : current.getCreatedBy()
        );
    }

    public ProcurementSupplierSearchRunStatus statusOf(ProcurementSupplierSearchRunModel model) {
        return ProcurementSupplierSearchRunStatus.fromValue(model.getStatus());
    }

    private ProcurementSupplierSearchRunModel update(
            UUID searchRunId,
            UUID updatedBy,
            String[] fields,
            Object... values) {
        return repository.update(searchRunId, fields, values)
            .orElseThrow(() -> new IllegalStateException("Failed to update supplier search run " + searchRunId));
    }

    private String normalizeBlank(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
