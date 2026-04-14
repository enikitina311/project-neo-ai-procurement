package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysis;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysisModel;

@Mapper(componentModel = "spring")
public interface ProcurementKpAnalysisMapper extends CoreMapper<ProcurementKpAnalysis, ProcurementKpAnalysisModel> {
    @Override
    ProcurementKpAnalysis map(ProcurementKpAnalysisModel source);

    @Override
    List<ProcurementKpAnalysis> mapList(List<ProcurementKpAnalysisModel> sources);
}
