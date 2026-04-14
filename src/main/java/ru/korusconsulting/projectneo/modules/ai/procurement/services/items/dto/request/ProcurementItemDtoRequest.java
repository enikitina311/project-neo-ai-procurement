package ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.request;

import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
public class ProcurementItemDtoRequest implements Identifiable<UUID> {
    private UUID id;
    private UUID packageId;
    private String name;
    private String specs;
    private Double qty;
    private String unit;
}
