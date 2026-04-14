package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.kp;

import java.time.OffsetDateTime;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocumentService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.request.ProcurementKpDocumentDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementFunctionArgs;

@Extension
public class KpUpload extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__kp_upload";
    }

    @Override
    public String description() {
        return "Register KP document: package_id, supplier_id, file_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 3, "Expected 3 arguments: package_id, supplier_id, file_id");

        ProcurementKpDocumentDtoRequest request = new ProcurementKpDocumentDtoRequest();
        request.setPackageId(ProcurementFunctionArgs.uuid(args, 0));
        request.setSupplierId(ProcurementFunctionArgs.uuid(args, 1));
        request.setFileId(ProcurementFunctionArgs.uuid(args, 2));
        request.setUploadedAt(OffsetDateTime.now());

        return AppContext.tryGet(ProcurementKpDocumentService.class).create(request);
    }
}
