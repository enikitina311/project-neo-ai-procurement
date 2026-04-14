package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.request;

import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
public class ProcurementSupplierDtoRequest implements Identifiable<UUID> {
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
}
