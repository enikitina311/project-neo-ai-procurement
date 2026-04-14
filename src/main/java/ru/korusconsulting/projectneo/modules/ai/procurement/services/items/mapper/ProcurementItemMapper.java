package ru.korusconsulting.projectneo.modules.ai.procurement.services.items.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItem;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItemModel;

@Mapper(componentModel = "spring")
public interface ProcurementItemMapper extends CoreMapper<ProcurementItem, ProcurementItemModel> {
    @Override
    ProcurementItem map(ProcurementItemModel source);

    @Override
    List<ProcurementItem> mapList(List<ProcurementItemModel> sources);
}
