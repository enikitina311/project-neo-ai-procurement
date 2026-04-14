package ru.korusconsulting.projectneo.modules.ai.procurement.services.packages;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.entities.CoreEntity;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.mapper.ProcurementPackageMapper;

@Data
@CoreMapping(source = ProcurementPackageModel.class, mapperClass = ProcurementPackageMapper.class)
public class ProcurementPackage implements CoreEntity<ProcurementPackage, ProcurementPackageModel> {
    private UUID id;
    private UUID projectId;
    private String name;
    private String criteriaText;
    private Double coverageThreshold;
    private Integer suppliersLimit;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
