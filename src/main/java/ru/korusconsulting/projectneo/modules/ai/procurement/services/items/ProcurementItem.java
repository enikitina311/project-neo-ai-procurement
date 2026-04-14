package ru.korusconsulting.projectneo.modules.ai.procurement.services.items;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.entities.CoreEntity;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.mapper.ProcurementItemMapper;

@Data
@CoreMapping(source = ProcurementItemModel.class, mapperClass = ProcurementItemMapper.class)
public class ProcurementItem implements CoreEntity<ProcurementItem, ProcurementItemModel> {
    private UUID id;
    private UUID packageId;
    private String name;
    private String specs;
    private Double qty;
    private String unit;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
