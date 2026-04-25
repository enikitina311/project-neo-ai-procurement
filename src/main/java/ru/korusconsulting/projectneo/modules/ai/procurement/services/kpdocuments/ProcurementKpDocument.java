package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.entities.CoreEntity;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.mapper.ProcurementKpDocumentMapper;

@Data
@CoreMapping(source = ProcurementKpDocumentModel.class, mapperClass = ProcurementKpDocumentMapper.class)
public class ProcurementKpDocument implements CoreEntity<ProcurementKpDocument, ProcurementKpDocumentModel> {
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
