package ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.repositories.Table;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
@Table("procurement__nmc_results")
public class ProcurementNmcResultModel implements Identifiable<UUID> {
    private UUID id;
    private UUID packageId;
    private String nmcTableJson;
    private String nmcTableText;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
