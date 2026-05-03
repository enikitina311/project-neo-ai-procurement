package ru.korusconsulting.projectneo.modules.ai.procurement.services.packages;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ru.korusconsulting.projectneo.core.common.repositories.BaseRepository;
import ru.korusconsulting.projectneo.core.common.repositories.RepositoryFactory;
import ru.korusconsulting.projectneo.core.common.repositories.query.FieldCondition;
import ru.korusconsulting.projectneo.core.services.base.BaseDataServiceImpl;
import ru.korusconsulting.projectneo.core.services.base.BaseReadWriteService;
import ru.korusconsulting.projectneo.core.services.base.ReadWriteServiceFactory;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.request.ProcurementPackageDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;

@Service
@Transactional
public class ProcurementPackageServiceImpl extends BaseDataServiceImpl<ProcurementPackageModel, ProcurementPackage, ProcurementPackageDto>
        implements ProcurementPackageService {

    @Autowired
    public ProcurementPackageServiceImpl(RepositoryFactory factory) {
        this(factory.createRepository(ProcurementPackageModel.class));
    }

    private ProcurementPackageServiceImpl(BaseRepository<ProcurementPackageModel> repository) {
        super(repository, createWriteService(repository), ProcurementPackageDto.class);
    }

    private static BaseReadWriteService<ProcurementPackageModel, ProcurementPackage, ProcurementPackageDto, ?, ?, ?> createWriteService(
            BaseRepository<ProcurementPackageModel> repository) {
        return ReadWriteServiceFactory.createUnsafe(
            repository,
            ProcurementPackage.class,
            ProcurementPackageDto.class,
            new String[] {"workspace_id", "name", "criteria_text", "coverage_threshold", "suppliers_limit"},
            (ProcurementPackageDtoRequest r) -> new Object[] {
                r.getWorkspaceId(),
                r.getName(),
                r.getCriteriaText(),
                r.getCoverageThreshold(),
                r.getSuppliersLimit()
            },
            (ProcurementPackageDtoRequest r) -> Arrays.asList(
                FieldCondition.of("workspace_id", "=", r.getWorkspaceId())
            )
        );
    }

    @Override
    public List<ProcurementPackageDto> listByWorkspaceId(UUID workspaceId) {
        return findByField("workspace_id", workspaceId);
    }
}
