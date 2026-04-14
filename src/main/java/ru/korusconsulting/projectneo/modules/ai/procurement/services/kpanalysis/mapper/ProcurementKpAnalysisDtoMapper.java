package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysis;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response.ProcurementKpAnalysisDto;

@Mapper(componentModel = "spring")
public interface ProcurementKpAnalysisDtoMapper extends CoreMapper<ProcurementKpAnalysisDto, ProcurementKpAnalysis> {
    @Override
    @Mapping(target = "createdAt", expression = "java(toInstant(source.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(toInstant(source.getUpdatedAt()))")
    ProcurementKpAnalysisDto map(ProcurementKpAnalysis source);

    @Override
    List<ProcurementKpAnalysisDto> mapList(List<ProcurementKpAnalysis> sources);

    default Instant toInstant(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? offsetDateTime.toInstant() : null;
    }
}
