package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliersearch;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.repositories.Table;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
@Table("procurement__supplier_search_runs")
public class ProcurementSupplierSearchRunModel implements Identifiable<UUID> {
    private UUID id;
    private UUID packageId;
    private String query;
    private String status;
    private String requestPayloadJson;
    private String resultRaw;
    private String resultParsedJson;
    private String errorText;
    private String n8nExecutionId;
    private Boolean cancelRequested;
    private OffsetDateTime startedAt;
    private OffsetDateTime finishedAt;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
