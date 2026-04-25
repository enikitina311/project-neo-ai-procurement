package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.mapper.CoreMapping;
import ru.korusconsulting.projectneo.core.common.entities.CoreEntity;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.mapper.ProcurementKpAnalysisMapper;

@Data
@CoreMapping(source = ProcurementKpAnalysisModel.class, mapperClass = ProcurementKpAnalysisMapper.class)
public class ProcurementKpAnalysis implements CoreEntity<ProcurementKpAnalysis, ProcurementKpAnalysisModel> {
    private UUID id;
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
    private UUID createdBy;
    private UUID updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
