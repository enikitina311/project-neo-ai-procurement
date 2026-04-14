package ru.korusconsulting.projectneo.modules.ai.procurement.services.items.mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItem;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.response.ProcurementItemDto;

@Mapper(componentModel = "spring")
public interface ProcurementItemDtoMapper extends CoreMapper<ProcurementItemDto, ProcurementItem> {
    @Override
    @Mapping(target = "createdAt", expression = "java(toInstant(source.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(toInstant(source.getUpdatedAt()))")
    ProcurementItemDto map(ProcurementItem source);

    @Override
    List<ProcurementItemDto> mapList(List<ProcurementItem> sources);

    default Instant toInstant(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? offsetDateTime.toInstant() : null;
    }
}
