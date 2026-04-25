package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.dto.CoreBaseDtoImpl;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocument;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.mapper.ProcurementKpDocumentDtoMapper;

@Data
@EqualsAndHashCode(callSuper = false)
@CoreMapping(source = ProcurementKpDocument.class, mapperClass = ProcurementKpDocumentDtoMapper.class)
public class ProcurementKpDocumentDto extends CoreBaseDtoImpl<ProcurementKpDocumentDto, ProcurementKpDocument> {
    private UUID packageId;
    private UUID fileId;
    private String fileName;
    private String supplierName;
    private OffsetDateTime uploadedAt;
}
