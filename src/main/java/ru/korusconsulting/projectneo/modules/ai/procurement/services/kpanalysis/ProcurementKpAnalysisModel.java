package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.annotation.repositories.Table;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
@Table("procurement__kp_analysis")
public class ProcurementKpAnalysisModel implements Identifiable<UUID> {
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
