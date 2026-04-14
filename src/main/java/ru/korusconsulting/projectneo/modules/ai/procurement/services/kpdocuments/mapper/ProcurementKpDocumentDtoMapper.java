package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocument;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.response.ProcurementKpDocumentDto;

@Mapper(componentModel = "spring")
public interface ProcurementKpDocumentDtoMapper extends CoreMapper<ProcurementKpDocumentDto, ProcurementKpDocument> {
    @Override
    @Mapping(target = "createdAt", expression = "java(toInstant(source.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(toInstant(source.getUpdatedAt()))")
    ProcurementKpDocumentDto map(ProcurementKpDocument source);

    @Override
    List<ProcurementKpDocumentDto> mapList(List<ProcurementKpDocument> sources);

    default Instant toInstant(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? offsetDateTime.toInstant() : null;
    }
}
