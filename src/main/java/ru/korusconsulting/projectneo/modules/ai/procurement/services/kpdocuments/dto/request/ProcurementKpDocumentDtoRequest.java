package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.request;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
public class ProcurementKpDocumentDtoRequest implements Identifiable<UUID> {
    private UUID id;
    private UUID packageId;
    private UUID fileId;
    private String fileName;
    private String supplierName;
    private OffsetDateTime uploadedAt;
}
