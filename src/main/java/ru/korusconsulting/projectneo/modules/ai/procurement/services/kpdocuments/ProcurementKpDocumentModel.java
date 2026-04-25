package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.repositories.Table;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
@Table("procurement__kp_documents")
public class ProcurementKpDocumentModel implements Identifiable<UUID> {
    private UUID id;
    private UUID packageId;
    private UUID fileId;
    private String fileName;
    private String supplierName;
    private OffsetDateTime uploadedAt;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
