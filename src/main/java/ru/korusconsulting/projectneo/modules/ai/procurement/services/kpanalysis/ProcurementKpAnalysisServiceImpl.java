package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis;

import java.util.Arrays;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ru.korusconsulting.projectneo.core.common.repositories.BaseRepository;
import ru.korusconsulting.projectneo.core.common.repositories.RepositoryFactory;
import ru.korusconsulting.projectneo.core.common.repositories.query.FieldCondition;
import ru.korusconsulting.projectneo.core.common.repositories.query.QuerySpec;
import ru.korusconsulting.projectneo.core.services.base.BaseDataServiceImpl;
import ru.korusconsulting.projectneo.core.services.base.BaseReadWriteService;
import ru.korusconsulting.projectneo.core.services.base.ReadWriteServiceFactory;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.request.ProcurementKpAnalysisDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response.ProcurementKpAnalysisDto;

@Service
@Transactional
public class ProcurementKpAnalysisServiceImpl extends BaseDataServiceImpl<ProcurementKpAnalysisModel, ProcurementKpAnalysis, ProcurementKpAnalysisDto>
        implements ProcurementKpAnalysisService {

    private final BaseRepository<ProcurementKpAnalysisModel> repository;

    @Autowired
    public ProcurementKpAnalysisServiceImpl(RepositoryFactory factory) {
        this(factory.createRepository(ProcurementKpAnalysisModel.class));
    }

    private ProcurementKpAnalysisServiceImpl(BaseRepository<ProcurementKpAnalysisModel> repository) {
        super(repository, createWriteService(repository), ProcurementKpAnalysisDto.class);
        this.repository = repository;
    }

    private static BaseReadWriteService<ProcurementKpAnalysisModel, ProcurementKpAnalysis, ProcurementKpAnalysisDto, ?, ?, ?> createWriteService(
            BaseRepository<ProcurementKpAnalysisModel> repository) {
        return ReadWriteServiceFactory.createUnsafe(
            repository,
            ProcurementKpAnalysis.class,
            ProcurementKpAnalysisDto.class,
            new String[] {
                "kp_document_id",
                "source_text",
                "extraction_status",
                "analysis_status",
                "extracted_at",
                "analyzed_at",
                "extracted_facts_json",
                "total_without_vat",
                "total_with_vat",
                "summary",
                "standard_checks_json",
                "criteria_evaluation_json",
                "supplier_name",
                "is_complete",
                "missing_fields",
                "extracted_items_json",
                "notes"
            },
            (ProcurementKpAnalysisDtoRequest r) -> new Object[] {
                r.getKpDocumentId(),
                r.getSourceText(),
                r.getExtractionStatus(),
                r.getAnalysisStatus(),
                r.getExtractedAt(),
                r.getAnalyzedAt(),
                r.getExtractedFactsJson(),
                r.getTotalWithoutVat(),
                r.getTotalWithVat(),
                r.getSummary(),
                r.getStandardChecksJson(),
                r.getCriteriaEvaluationJson(),
                r.getSupplierName(),
                r.getIsComplete(),
                r.getMissingFields(),
                r.getExtractedItemsJson(),
                r.getNotes()
            },
            (ProcurementKpAnalysisDtoRequest r) -> Arrays.asList(
                FieldCondition.of("kp_document_id", "=", r.getKpDocumentId())
            )
        );
    }

    @Override
    public ProcurementKpAnalysisDto findByKpDocumentId(UUID kpDocumentId) {
        var result = map(
            repository.find(QuerySpec.where("kp_document_id", "=", kpDocumentId)),
            this.readWrite.entityClass,
            this.readWrite.responseClass
        );
        return result.isEmpty() ? null : result.get(0);
    }

    @Override
    public ProcurementKpAnalysisDto saveOrUpdate(ProcurementKpAnalysisDto payload) {
        ProcurementKpAnalysisDto existing = findByKpDocumentId(payload.getKpDocumentId());
        if (existing == null) {
            ProcurementKpAnalysisDtoRequest createRequest = new ProcurementKpAnalysisDtoRequest();
            createRequest.setKpDocumentId(payload.getKpDocumentId());
            createRequest.setSourceText(payload.getSourceText());
            createRequest.setExtractionStatus(payload.getExtractionStatus());
            createRequest.setAnalysisStatus(payload.getAnalysisStatus());
            createRequest.setExtractedAt(payload.getExtractedAt());
            createRequest.setAnalyzedAt(payload.getAnalyzedAt());
            createRequest.setExtractedFactsJson(payload.getExtractedFactsJson());
            createRequest.setTotalWithoutVat(payload.getTotalWithoutVat());
            createRequest.setTotalWithVat(payload.getTotalWithVat());
            createRequest.setSummary(payload.getSummary());
            createRequest.setStandardChecksJson(payload.getStandardChecksJson());
            createRequest.setCriteriaEvaluationJson(payload.getCriteriaEvaluationJson());
            createRequest.setSupplierName(payload.getSupplierName());
            createRequest.setIsComplete(payload.getIsComplete());
            createRequest.setMissingFields(payload.getMissingFields());
            createRequest.setExtractedItemsJson(payload.getExtractedItemsJson());
            createRequest.setNotes(payload.getNotes());
            return this.create(createRequest);
        }

        ProcurementKpAnalysisDtoRequest updateRequest = new ProcurementKpAnalysisDtoRequest();
        updateRequest.setId(existing.getId());
        updateRequest.setKpDocumentId(payload.getKpDocumentId());
        updateRequest.setSourceText(payload.getSourceText());
        updateRequest.setExtractionStatus(payload.getExtractionStatus());
        updateRequest.setAnalysisStatus(payload.getAnalysisStatus());
        updateRequest.setExtractedAt(payload.getExtractedAt());
        updateRequest.setAnalyzedAt(payload.getAnalyzedAt());
        updateRequest.setExtractedFactsJson(payload.getExtractedFactsJson());
        updateRequest.setTotalWithoutVat(payload.getTotalWithoutVat());
        updateRequest.setTotalWithVat(payload.getTotalWithVat());
        updateRequest.setSummary(payload.getSummary());
        updateRequest.setStandardChecksJson(payload.getStandardChecksJson());
        updateRequest.setCriteriaEvaluationJson(payload.getCriteriaEvaluationJson());
        updateRequest.setSupplierName(payload.getSupplierName());
        updateRequest.setIsComplete(payload.getIsComplete());
        updateRequest.setMissingFields(payload.getMissingFields());
        updateRequest.setExtractedItemsJson(payload.getExtractedItemsJson());
        updateRequest.setNotes(payload.getNotes());
        return this.update(updateRequest);
    }
}
