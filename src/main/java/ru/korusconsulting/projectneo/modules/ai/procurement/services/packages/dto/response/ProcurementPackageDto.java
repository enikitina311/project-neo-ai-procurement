package ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response;

import java.util.UUID;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.dto.CoreBaseDtoImpl;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackage;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.mapper.ProcurementPackageDtoMapper;

@Data
@EqualsAndHashCode(callSuper = false)
@CoreMapping(source = ProcurementPackage.class, mapperClass = ProcurementPackageDtoMapper.class)
public class ProcurementPackageDto extends CoreBaseDtoImpl<ProcurementPackageDto, ProcurementPackage> {
    private UUID workspaceId;
    private String name;
    private String criteriaText;
    private Double coverageThreshold;
    private Integer suppliersLimit;
}
