package ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.ProcurementLetter;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.response.ProcurementLetterDto;

@Mapper(componentModel = "spring")
public interface ProcurementLetterDtoMapper extends CoreMapper<ProcurementLetterDto, ProcurementLetter> {
    @Override
    @Mapping(target = "createdAt", expression = "java(toInstant(source.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(toInstant(source.getUpdatedAt()))")
    ProcurementLetterDto map(ProcurementLetter source);

    @Override
    List<ProcurementLetterDto> mapList(List<ProcurementLetter> sources);

    default Instant toInstant(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? offsetDateTime.toInstant() : null;
    }
}
