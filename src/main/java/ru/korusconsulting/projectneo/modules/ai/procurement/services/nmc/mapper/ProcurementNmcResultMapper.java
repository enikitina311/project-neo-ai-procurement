package ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.ProcurementNmcResult;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.ProcurementNmcResultModel;

@Mapper(componentModel = "spring")
public interface ProcurementNmcResultMapper extends CoreMapper<ProcurementNmcResult, ProcurementNmcResultModel> {
    @Override
    ProcurementNmcResult map(ProcurementNmcResultModel source);

    @Override
    List<ProcurementNmcResult> mapList(List<ProcurementNmcResultModel> sources);
}
