package ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.request;

import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
public class ProcurementPackageDtoRequest implements Identifiable<UUID> {
    private UUID id;
    private UUID workspaceId;
    private String name;
    private String criteriaText;
    private Double coverageThreshold;
    private Integer suppliersLimit;
}
