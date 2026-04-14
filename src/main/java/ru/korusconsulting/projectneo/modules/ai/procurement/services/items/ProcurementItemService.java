package ru.korusconsulting.projectneo.modules.ai.procurement.services.items;

import java.util.List;
import java.util.UUID;

import ru.korusconsulting.projectneo.core.services.base.DataService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.response.ProcurementItemDto;

public interface ProcurementItemService extends DataService<ProcurementItemDto> {
    List<ProcurementItemDto> listByPackageId(UUID packageId);
    void deleteById(UUID itemId);
}
