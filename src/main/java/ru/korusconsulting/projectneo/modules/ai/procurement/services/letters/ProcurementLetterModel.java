package ru.korusconsulting.projectneo.modules.ai.procurement.services.letters;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.repositories.Table;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
@Table("procurement__letters")
public class ProcurementLetterModel implements Identifiable<UUID> {
    private UUID id;
    private UUID packageId;
    private UUID supplierId;
    private String subject;
    private String body;
    private String status;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
