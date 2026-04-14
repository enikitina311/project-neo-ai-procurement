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
            new String[] {"kp_document_id", "is_complete", "missing_fields", "extracted_items_json", "notes"},
            (ProcurementKpAnalysisDtoRequest r) -> new Object[] {
                r.getKpDocumentId(),
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
            createRequest.setIsComplete(payload.getIsComplete());
            createRequest.setMissingFields(payload.getMissingFields());
            createRequest.setExtractedItemsJson(payload.getExtractedItemsJson());
            createRequest.setNotes(payload.getNotes());
            return this.create(createRequest);
        }

        ProcurementKpAnalysisDtoRequest updateRequest = new ProcurementKpAnalysisDtoRequest();
        updateRequest.setId(existing.getId());
        updateRequest.setKpDocumentId(payload.getKpDocumentId());
        updateRequest.setIsComplete(payload.getIsComplete());
        updateRequest.setMissingFields(payload.getMissingFields());
        updateRequest.setExtractedItemsJson(payload.getExtractedItemsJson());
        updateRequest.setNotes(payload.getNotes());
        return this.update(updateRequest);
    }
}
