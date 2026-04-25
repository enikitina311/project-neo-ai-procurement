package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response;

import java.time.OffsetDateTime;
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
    private String sourceText;
    private String extractionStatus;
    private String analysisStatus;
    private OffsetDateTime extractedAt;
    private OffsetDateTime analyzedAt;
    private String extractedFactsJson;
    private String totalWithoutVat;
    private String totalWithVat;
    private String summary;
    private String standardChecksJson;
    private String criteriaEvaluationJson;
    private String supplierName;
    private Boolean isComplete;
    private String missingFields;
    private String extractedItemsJson;
    private String notes;
}
