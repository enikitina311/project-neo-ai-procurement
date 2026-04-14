package ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.response;

import java.util.UUID;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.dto.CoreBaseDtoImpl;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.ProcurementNmcResult;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.mapper.ProcurementNmcResultDtoMapper;

@Data
@EqualsAndHashCode(callSuper = false)
@CoreMapping(source = ProcurementNmcResult.class, mapperClass = ProcurementNmcResultDtoMapper.class)
public class ProcurementNmcResultDto extends CoreBaseDtoImpl<ProcurementNmcResultDto, ProcurementNmcResult> {
    private UUID packageId;
    private String nmcTableJson;
    private String nmcTableText;
}
