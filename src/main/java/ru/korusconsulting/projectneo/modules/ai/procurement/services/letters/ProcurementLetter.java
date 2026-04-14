package ru.korusconsulting.projectneo.modules.ai.procurement.services.letters;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.entities.CoreEntity;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.mapper.ProcurementLetterMapper;

@Data
@CoreMapping(source = ProcurementLetterModel.class, mapperClass = ProcurementLetterMapper.class)
public class ProcurementLetter implements CoreEntity<ProcurementLetter, ProcurementLetterModel> {
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
