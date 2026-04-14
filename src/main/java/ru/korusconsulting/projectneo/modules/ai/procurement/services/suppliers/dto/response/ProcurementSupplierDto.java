package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.response;

import java.util.UUID;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.dto.CoreBaseDtoImpl;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplier;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.mapper.ProcurementSupplierDtoMapper;

@Data
@EqualsAndHashCode(callSuper = false)
@CoreMapping(source = ProcurementSupplier.class, mapperClass = ProcurementSupplierDtoMapper.class)
public class ProcurementSupplierDto extends CoreBaseDtoImpl<ProcurementSupplierDto, ProcurementSupplier> {
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
}
