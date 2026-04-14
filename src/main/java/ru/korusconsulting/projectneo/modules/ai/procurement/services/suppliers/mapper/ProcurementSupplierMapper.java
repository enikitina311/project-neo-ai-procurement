package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplier;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplierModel;

@Mapper(componentModel = "spring")
public interface ProcurementSupplierMapper extends CoreMapper<ProcurementSupplier, ProcurementSupplierModel> {
    @Override
    ProcurementSupplier map(ProcurementSupplierModel source);

    @Override
    List<ProcurementSupplier> mapList(List<ProcurementSupplierModel> sources);
}
