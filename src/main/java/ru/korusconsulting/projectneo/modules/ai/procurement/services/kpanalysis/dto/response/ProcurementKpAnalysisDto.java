package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response;

import java.util.UUID;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.dto.CoreBaseDtoImpl;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysis;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.mapper.ProcurementKpAnalysisDtoMapper;

@Data
@EqualsAndHashCode(callSuper = false)
@CoreMapping(source = ProcurementKpAnalysis.class, mapperClass = ProcurementKpAnalysisDtoMapper.class)
public class ProcurementKpAnalysisDto extends CoreBaseDtoImpl<ProcurementKpAnalysisDto, ProcurementKpAnalysis> {
    private UUID kpDocumentId;
    private Boolean isComplete;
    private String missingFields;
    private String extractedItemsJson;
    private String notes;
}
