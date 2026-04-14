package ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.response;

import java.util.UUID;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.dto.CoreBaseDtoImpl;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.ProcurementLetter;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.mapper.ProcurementLetterDtoMapper;

@Data
@EqualsAndHashCode(callSuper = false)
@CoreMapping(source = ProcurementLetter.class, mapperClass = ProcurementLetterDtoMapper.class)
public class ProcurementLetterDto extends CoreBaseDtoImpl<ProcurementLetterDto, ProcurementLetter> {
    private UUID packageId;
    private UUID supplierId;
    private String subject;
    private String body;
    private String status;
}
