package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.repositories.BaseRepository;
import ru.korusconsulting.projectneo.core.common.repositories.RepositoryFactory;
import ru.korusconsulting.projectneo.core.common.repositories.query.FieldCondition;
import ru.korusconsulting.projectneo.core.services.filestorage.FileStorageService;
import ru.korusconsulting.projectneo.core.services.base.BaseDataServiceImpl;
import ru.korusconsulting.projectneo.core.services.base.BaseReadWriteService;
import ru.korusconsulting.projectneo.core.services.base.ReadWriteServiceFactory;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysisService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response.ProcurementKpAnalysisDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.request.ProcurementKpDocumentDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.response.ProcurementKpDocumentDto;

@Service
@Transactional
public class ProcurementKpDocumentServiceImpl extends BaseDataServiceImpl<ProcurementKpDocumentModel, ProcurementKpDocument, ProcurementKpDocumentDto>
        implements ProcurementKpDocumentService {

    private final BaseRepository<ProcurementKpDocumentModel> repository;

    @Autowired
    public ProcurementKpDocumentServiceImpl(RepositoryFactory factory) {
        this(factory.createRepository(ProcurementKpDocumentModel.class));
    }

    private ProcurementKpDocumentServiceImpl(BaseRepository<ProcurementKpDocumentModel> repository) {
        super(repository, createWriteService(repository), ProcurementKpDocumentDto.class);
        this.repository = repository;
    }

    private static BaseReadWriteService<ProcurementKpDocumentModel, ProcurementKpDocument, ProcurementKpDocumentDto, ?, ?, ?> createWriteService(
            BaseRepository<ProcurementKpDocumentModel> repository) {
        return ReadWriteServiceFactory.createUnsafe(
            repository,
            ProcurementKpDocument.class,
            ProcurementKpDocumentDto.class,
            new String[] {"package_id", "file_id", "file_name", "supplier_name", "uploaded_at"},
            (ProcurementKpDocumentDtoRequest r) -> new Object[] {
                r.getPackageId(),
                r.getFileId(),
                r.getFileName(),
                r.getSupplierName(),
                r.getUploadedAt()
            },
            (ProcurementKpDocumentDtoRequest r) -> Arrays.asList(
                FieldCondition.of("package_id", "=", r.getPackageId())
            )
        );
    }

    @Override
    public List<ProcurementKpDocumentDto> listByPackageId(UUID packageId) {
        return findByField("package_id", packageId);
    }

    @Override
    public ProcurementKpDocumentDto updateSupplierName(UUID kpDocumentId, String supplierName) {
        return updateField(kpDocumentId, "supplier_name", supplierName);
    }

    @Override
    public void deleteById(UUID kpDocumentId) {
        if (kpDocumentId == null) {
            throw new IllegalArgumentException("KP document id is required");
        }

        ProcurementKpDocumentDto document = getNoThrow(kpDocumentId);
        if (document == null) {
            return;
        }

        ProcurementKpAnalysisService analysisService =
            AppContext.tryGet(ProcurementKpAnalysisService.class);
        ProcurementKpAnalysisDto analysis = analysisService.findByKpDocumentId(kpDocumentId);

        if (analysis != null) {
            analysisService.delete(analysis.getId());
        }

        delete(kpDocumentId);

        if (document.getFileId() != null) {
            AppContext.tryGet(FileStorageService.class).delete(document.getFileId());
        }
    }
}
