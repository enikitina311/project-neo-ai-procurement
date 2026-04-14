package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.mapper;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplier;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.response.ProcurementSupplierDto;

@Mapper(componentModel = "spring")
public interface ProcurementSupplierDtoMapper extends CoreMapper<ProcurementSupplierDto, ProcurementSupplier> {
    @Override
    @Mapping(target = "createdAt", expression = "java(toInstant(source.getCreatedAt()))")
    @Mapping(target = "updatedAt", expression = "java(toInstant(source.getUpdatedAt()))")
    ProcurementSupplierDto map(ProcurementSupplier source);

    @Override
    List<ProcurementSupplierDto> mapList(List<ProcurementSupplier> sources);

    default Instant toInstant(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? offsetDateTime.toInstant() : null;
    }
}
