package ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.request;

import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
public class ProcurementNmcResultDtoRequest implements Identifiable<UUID> {
    private UUID id;
    private UUID packageId;
    private String nmcTableJson;
    private String nmcTableText;
}
