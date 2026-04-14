package ru.korusconsulting.projectneo.modules.ai.procurement.services.letters;

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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.request.ProcurementLetterDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.response.ProcurementLetterDto;

@Service
@Transactional
public class ProcurementLetterServiceImpl extends BaseDataServiceImpl<ProcurementLetterModel, ProcurementLetter, ProcurementLetterDto>
        implements ProcurementLetterService {

    @Autowired
    public ProcurementLetterServiceImpl(RepositoryFactory factory) {
        this(factory.createRepository(ProcurementLetterModel.class));
    }

    private ProcurementLetterServiceImpl(BaseRepository<ProcurementLetterModel> repository) {
        super(repository, createWriteService(repository), ProcurementLetterDto.class);
    }

    private static BaseReadWriteService<ProcurementLetterModel, ProcurementLetter, ProcurementLetterDto, ?, ?, ?> createWriteService(
            BaseRepository<ProcurementLetterModel> repository) {
        return ReadWriteServiceFactory.createUnsafe(
            repository,
            ProcurementLetter.class,
            ProcurementLetterDto.class,
            new String[] {"package_id", "supplier_id", "subject", "body", "status"},
            (ProcurementLetterDtoRequest r) -> new Object[] {
                r.getPackageId(),
                r.getSupplierId(),
                r.getSubject(),
                r.getBody(),
                r.getStatus()
            },
            (ProcurementLetterDtoRequest r) -> Arrays.asList(
                FieldCondition.of("package_id", "=", r.getPackageId())
            )
        );
    }

    @Override
    public List<ProcurementLetterDto> listByPackageId(UUID packageId) {
        return findByField("package_id", packageId);
    }

    @Override
    public void deleteByPackageId(UUID packageId) {
        for (ProcurementLetterDto letter : listByPackageId(packageId)) {
            if (letter.getId() != null) {
                delete(letter.getId());
            }
        }
    }
}
