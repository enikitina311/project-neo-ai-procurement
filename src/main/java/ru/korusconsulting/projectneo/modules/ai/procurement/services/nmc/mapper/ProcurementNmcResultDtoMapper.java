package ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.ProcurementNmcResult;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.response.ProcurementNmcResultDto;

@Mapper(componentModel = "spring")
public interface ProcurementNmcResultDtoMapper extends CoreMapper<ProcurementNmcResultDto, ProcurementNmcResult> {
    @Override
    @Mapping(target = "createdAt", expression = "java(toInstant(source.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(toInstant(source.getUpdatedAt()))")
    ProcurementNmcResultDto map(ProcurementNmcResult source);

    @Override
    List<ProcurementNmcResultDto> mapList(List<ProcurementNmcResult> sources);

    default Instant toInstant(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? offsetDateTime.toInstant() : null;
    }
}
