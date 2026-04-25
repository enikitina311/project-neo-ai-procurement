package ru.korusconsulting.projectneo.modules.ai.procurement.services.items;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.repositories.Table;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
@Table("procurement.items")
public class ProcurementItemModel implements Identifiable<UUID> {
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
