package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers;

import java.util.List;
import java.util.UUID;

import ru.korusconsulting.projectneo.core.services.base.DataService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.response.ProcurementSupplierDto;

public interface ProcurementSupplierService extends DataService<ProcurementSupplierDto> {
    List<ProcurementSupplierDto> listByPackageId(UUID packageId);
    List<ProcurementSupplierDto> listSelectedByPackageId(UUID packageId);
    ProcurementSupplierDto updateSelected(UUID supplierId, boolean selected);
    void deleteById(UUID supplierId);
}
