package ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.entities.CoreEntity;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.mapper.ProcurementNmcResultMapper;

@Data
@CoreMapping(source = ProcurementNmcResultModel.class, mapperClass = ProcurementNmcResultMapper.class)
public class ProcurementNmcResult implements CoreEntity<ProcurementNmcResult, ProcurementNmcResultModel> {
    private UUID id;
    private UUID packageId;
    private String nmcTableJson;
    private String nmcTableText;
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
