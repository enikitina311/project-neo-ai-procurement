package ru.korusconsulting.projectneo.modules.ai.procurement.services.items;

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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.request.ProcurementItemDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.response.ProcurementItemDto;

@Service
@Transactional
public class ProcurementItemServiceImpl extends BaseDataServiceImpl<ProcurementItemModel, ProcurementItem, ProcurementItemDto>
        implements ProcurementItemService {

    private final BaseRepository<ProcurementItemModel> repository;

    @Autowired
    public ProcurementItemServiceImpl(RepositoryFactory factory) {
        this(factory.createRepository(ProcurementItemModel.class));
    }

    private ProcurementItemServiceImpl(BaseRepository<ProcurementItemModel> repository) {
        super(repository, createWriteService(repository), ProcurementItemDto.class);
        this.repository = repository;
    }

    private static BaseReadWriteService<ProcurementItemModel, ProcurementItem, ProcurementItemDto, ?, ?, ?> createWriteService(
            BaseRepository<ProcurementItemModel> repository) {
        return ReadWriteServiceFactory.createUnsafe(
            repository,
            ProcurementItem.class,
            ProcurementItemDto.class,
            new String[] {"package_id", "name", "specs", "qty", "unit"},
            (ProcurementItemDtoRequest r) -> new Object[] {
                r.getPackageId(),
                r.getName(),
                r.getSpecs(),
                r.getQty(),
                r.getUnit()
            },
            (ProcurementItemDtoRequest r) -> Arrays.asList(
                FieldCondition.of("package_id", "=", r.getPackageId())
            )
        );
    }

    @Override
    public List<ProcurementItemDto> listByPackageId(UUID packageId) {
        return findByField("package_id", packageId);
    }

    @Override
    public void deleteById(UUID itemId) {
        if (itemId == null) {
            return;
        }
        repository.deleteById(itemId);
    }
}
