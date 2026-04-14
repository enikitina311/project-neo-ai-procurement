package ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.request;

import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
public class ProcurementLetterDtoRequest implements Identifiable<UUID> {
    private UUID id;
    private UUID packageId;
    private UUID supplierId;
    private String subject;
    private String body;
    private String status;
}
