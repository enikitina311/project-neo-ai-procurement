package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments;

import java.util.List;
import java.util.UUID;

import ru.korusconsulting.projectneo.core.services.base.DataService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.response.ProcurementKpDocumentDto;

public interface ProcurementKpDocumentService extends DataService<ProcurementKpDocumentDto> {
    List<ProcurementKpDocumentDto> listByPackageId(UUID packageId);
    List<ProcurementKpDocumentDto> listBySupplierId(UUID supplierId);
}
