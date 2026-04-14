package ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc;

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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.request.ProcurementNmcResultDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.response.ProcurementNmcResultDto;

@Service
@Transactional
public class ProcurementNmcResultServiceImpl extends BaseDataServiceImpl<ProcurementNmcResultModel, ProcurementNmcResult, ProcurementNmcResultDto>
        implements ProcurementNmcResultService {

    private final BaseRepository<ProcurementNmcResultModel> repository;

    @Autowired
    public ProcurementNmcResultServiceImpl(RepositoryFactory factory) {
        this(factory.createRepository(ProcurementNmcResultModel.class));
    }

    private ProcurementNmcResultServiceImpl(BaseRepository<ProcurementNmcResultModel> repository) {
        super(repository, createWriteService(repository), ProcurementNmcResultDto.class);
        this.repository = repository;
    }

    private static BaseReadWriteService<ProcurementNmcResultModel, ProcurementNmcResult, ProcurementNmcResultDto, ?, ?, ?> createWriteService(
            BaseRepository<ProcurementNmcResultModel> repository) {
        return ReadWriteServiceFactory.createUnsafe(
            repository,
            ProcurementNmcResult.class,
            ProcurementNmcResultDto.class,
            new String[] {"package_id", "nmc_table_json", "nmc_table_text"},
            (ProcurementNmcResultDtoRequest r) -> new Object[] {
                r.getPackageId(),
                r.getNmcTableJson(),
                r.getNmcTableText()
            },
            (ProcurementNmcResultDtoRequest r) -> Arrays.asList(
                FieldCondition.of("package_id", "=", r.getPackageId())
            )
        );
    }

    @Override
    public ProcurementNmcResultDto findByPackageId(UUID packageId) {
        var result = map(
            repository.find(QuerySpec.where("package_id", "=", packageId)),
            this.readWrite.entityClass,
            this.readWrite.responseClass
        );
        return result.isEmpty() ? null : result.get(0);
    }

    @Override
    public ProcurementNmcResultDto saveOrUpdate(ProcurementNmcResultDto payload) {
        ProcurementNmcResultDto existing = findByPackageId(payload.getPackageId());
        if (existing == null) {
            ProcurementNmcResultDtoRequest createRequest = new ProcurementNmcResultDtoRequest();
            createRequest.setPackageId(payload.getPackageId());
            createRequest.setNmcTableJson(payload.getNmcTableJson());
            createRequest.setNmcTableText(payload.getNmcTableText());
            return this.create(createRequest);
        }

        ProcurementNmcResultDtoRequest updateRequest = new ProcurementNmcResultDtoRequest();
        updateRequest.setId(existing.getId());
        updateRequest.setPackageId(payload.getPackageId());
        updateRequest.setNmcTableJson(payload.getNmcTableJson());
        updateRequest.setNmcTableText(payload.getNmcTableText());
        return this.update(updateRequest);
    }
}
