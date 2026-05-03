package ru.korusconsulting.projectneo.modules.ai.procurement.services.packages;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.repositories.Table;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
@Table("procurement.packages")
public class ProcurementPackageModel implements Identifiable<UUID> {
    private UUID id;
    private UUID workspaceId;
    private String name;
    private String criteriaText;
    private Double coverageThreshold;
    private Integer suppliersLimit;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
