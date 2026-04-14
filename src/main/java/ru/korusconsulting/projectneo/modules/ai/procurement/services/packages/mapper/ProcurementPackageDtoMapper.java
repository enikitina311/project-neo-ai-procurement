package ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackage;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;

@Mapper(componentModel = "spring")
public interface ProcurementPackageDtoMapper extends CoreMapper<ProcurementPackageDto, ProcurementPackage> {
    @Override
    @Mapping(target = "createdAt", expression = "java(toInstant(source.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(toInstant(source.getUpdatedAt()))")
    ProcurementPackageDto map(ProcurementPackage source);

    @Override
    List<ProcurementPackageDto> mapList(List<ProcurementPackage> sources);

    default Instant toInstant(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? offsetDateTime.toInstant() : null;
    }
}
