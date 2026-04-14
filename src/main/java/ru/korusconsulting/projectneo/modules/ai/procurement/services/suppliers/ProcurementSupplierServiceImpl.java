package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers;

import java.util.Arrays;
import java.util.List;
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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.request.ProcurementSupplierDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.response.ProcurementSupplierDto;

@Service
@Transactional
public class ProcurementSupplierServiceImpl extends BaseDataServiceImpl<ProcurementSupplierModel, ProcurementSupplier, ProcurementSupplierDto>
        implements ProcurementSupplierService {

    private final BaseRepository<ProcurementSupplierModel> repository;

    @Autowired
    public ProcurementSupplierServiceImpl(RepositoryFactory factory) {
        this(factory.createRepository(ProcurementSupplierModel.class));
    }

    private ProcurementSupplierServiceImpl(BaseRepository<ProcurementSupplierModel> repository) {
        super(repository, createWriteService(repository), ProcurementSupplierDto.class);
        this.repository = repository;
    }

    private static BaseReadWriteService<ProcurementSupplierModel, ProcurementSupplier, ProcurementSupplierDto, ?, ?, ?> createWriteService(
            BaseRepository<ProcurementSupplierModel> repository) {
        return ReadWriteServiceFactory.createUnsafe(
            repository,
            ProcurementSupplier.class,
            ProcurementSupplierDto.class,
            new String[] {
                "package_id",
                "name",
                "url",
                "email",
                "price",
                "unit",
                "note",
                "origin",
                "selected",
                "coverage_count",
                "coverage_ratio",
                "matched_items_json::jsonb"
            },
            (ProcurementSupplierDtoRequest r) -> new Object[] {
                r.getPackageId(),
                r.getName(),
                r.getUrl(),
                r.getEmail(),
                r.getPrice(),
                r.getUnit(),
                r.getNote(),
                r.getOrigin(),
                r.getSelected(),
                r.getCoverageCount(),
                r.getCoverageRatio(),
                r.getMatchedItemsJson()
            },
            (ProcurementSupplierDtoRequest r) -> Arrays.asList(
                FieldCondition.of("package_id", "=", r.getPackageId())
            )
        );
    }

    @Override
    public List<ProcurementSupplierDto> listByPackageId(UUID packageId) {
        return findByField("package_id", packageId);
    }

    @Override
    public List<ProcurementSupplierDto> listSelectedByPackageId(UUID packageId) {
        return map(
            repository.find(QuerySpec.<ProcurementSupplierModel>where("package_id", "=", packageId).and("selected", "=", true)),
            this.readWrite.entityClass,
            this.readWrite.responseClass
        );
    }

    @Override
    public ProcurementSupplierDto updateSelected(UUID supplierId, boolean selected) {
        return this.readWrite.updateField(supplierId, "selected", selected);
    }
}
