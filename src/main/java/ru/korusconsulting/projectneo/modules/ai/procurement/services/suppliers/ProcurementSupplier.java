package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.entities.CoreEntity;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.mapper.ProcurementSupplierMapper;

@Data
@CoreMapping(source = ProcurementSupplierModel.class, mapperClass = ProcurementSupplierMapper.class)
public class ProcurementSupplier implements CoreEntity<ProcurementSupplier, ProcurementSupplierModel> {
    private UUID id;
    private UUID packageId;
    private String name;
    private String url;
    private String email;
    private Double price;
    private String unit;
    private String note;
    private String origin;
    private Boolean selected;
    private Integer coverageCount;
    private Double coverageRatio;
    private String matchedItemsJson;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
