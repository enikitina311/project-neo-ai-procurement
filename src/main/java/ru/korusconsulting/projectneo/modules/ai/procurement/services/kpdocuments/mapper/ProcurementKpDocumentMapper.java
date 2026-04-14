package ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import ru.korusconsulting.projectneo.core.common.support.CoreMapper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocument;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocumentModel;

@Mapper(componentModel = "spring")
public interface ProcurementKpDocumentMapper extends CoreMapper<ProcurementKpDocument, ProcurementKpDocumentModel> {
    @Override
    ProcurementKpDocument map(ProcurementKpDocumentModel source);

    @Override
    List<ProcurementKpDocument> mapList(List<ProcurementKpDocumentModel> sources);
}
