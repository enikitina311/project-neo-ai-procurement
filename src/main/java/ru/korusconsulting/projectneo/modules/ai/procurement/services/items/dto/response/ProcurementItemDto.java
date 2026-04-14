package ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.response;

import java.util.UUID;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.dto.CoreBaseDtoImpl;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItem;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.mapper.ProcurementItemDtoMapper;

@Data
@EqualsAndHashCode(callSuper = false)
@CoreMapping(source = ProcurementItem.class, mapperClass = ProcurementItemDtoMapper.class)
public class ProcurementItemDto extends CoreBaseDtoImpl<ProcurementItemDto, ProcurementItem> {
    private UUID packageId;
    private String name;
    private String specs;
    private Double qty;
    private String unit;
}
