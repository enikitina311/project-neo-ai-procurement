package ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.ProcurementLetter;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.ProcurementLetterModel;

@Mapper(componentModel = "spring")
public interface ProcurementLetterMapper extends CoreMapper<ProcurementLetter, ProcurementLetterModel> {
    @Override
    ProcurementLetter map(ProcurementLetterModel source);

    @Override
    List<ProcurementLetter> mapList(List<ProcurementLetterModel> sources);
}
