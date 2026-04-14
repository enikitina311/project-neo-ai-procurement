package ru.korusconsulting.projectneo.modules.ai.procurement.services.letters;

import java.util.List;
import java.util.UUID;

import ru.korusconsulting.projectneo.core.services.base.DataService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.response.ProcurementLetterDto;

public interface ProcurementLetterService extends DataService<ProcurementLetterDto> {
    List<ProcurementLetterDto> listByPackageId(UUID packageId);

    void deleteByPackageId(UUID packageId);
}
