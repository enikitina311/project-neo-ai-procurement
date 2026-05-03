package ru.korusconsulting.projectneo.modules.ai.procurement.services.packages;

import java.util.List;
import java.util.UUID;

import ru.korusconsulting.projectneo.core.services.base.DataService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;

public interface ProcurementPackageService extends DataService<ProcurementPackageDto> {
    List<ProcurementPackageDto> listByWorkspaceId(UUID workspaceId);
}
