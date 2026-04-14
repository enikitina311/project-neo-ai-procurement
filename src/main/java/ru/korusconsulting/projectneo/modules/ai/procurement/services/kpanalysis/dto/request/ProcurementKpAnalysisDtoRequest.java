package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.request;

import java.util.UUID;

import lombok.Data;
import ru.korusconsulting.projectneo.core.common.repositories.Identifiable;

@Data
public class ProcurementKpAnalysisDtoRequest implements Identifiable<UUID> {
    private UUID id;
    private UUID kpDocumentId;
    private Boolean isComplete;
    private String missingFields;
    private String extractedItemsJson;
    private String notes;
}
