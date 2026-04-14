package ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackage;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageModel;

@Mapper(componentModel = "spring")
public interface ProcurementPackageMapper extends CoreMapper<ProcurementPackage, ProcurementPackageModel> {
    @Override
    ProcurementPackage map(ProcurementPackageModel source);

    @Override
    List<ProcurementPackage> mapList(List<ProcurementPackageModel> sources);
}
