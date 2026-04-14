package ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc;

import java.util.UUID;

import ru.korusconsulting.projectneo.core.services.base.DataService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.response.ProcurementNmcResultDto;

public interface ProcurementNmcResultService extends DataService<ProcurementNmcResultDto> {
    ProcurementNmcResultDto findByPackageId(UUID packageId);
    ProcurementNmcResultDto saveOrUpdate(ProcurementNmcResultDto payload);
}
