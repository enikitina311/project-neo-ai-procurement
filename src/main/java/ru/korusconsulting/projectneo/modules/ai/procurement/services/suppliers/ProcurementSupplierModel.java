package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.repositories.Table;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
@Table("procurement.suppliers")
public class ProcurementSupplierModel implements Identifiable<UUID> {
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
