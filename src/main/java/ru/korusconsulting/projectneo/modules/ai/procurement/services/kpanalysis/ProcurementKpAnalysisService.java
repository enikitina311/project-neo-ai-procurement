package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis;

import java.util.UUID;

import ru.korusconsulting.projectneo.core.services.base.DataService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response.ProcurementKpAnalysisDto;

public interface ProcurementKpAnalysisService extends DataService<ProcurementKpAnalysisDto> {
    ProcurementKpAnalysisDto findByKpDocumentId(UUID kpDocumentId);
    ProcurementKpAnalysisDto saveOrUpdate(ProcurementKpAnalysisDto payload);
}
