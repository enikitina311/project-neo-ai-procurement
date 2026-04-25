package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.kp;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.core.services.filestorage.FileStorageService;
import ru.korusconsulting.projectneo.core.services.filestorage.dto.response.FileStorageResponse;
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
        return "Register KP document: package_id, file_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 2, "Expected 2 arguments: package_id, file_id");

        ProcurementKpDocumentDtoRequest request = new ProcurementKpDocumentDtoRequest();
        UUID packageId = ProcurementFunctionArgs.uuid(args, 0);
        UUID fileId = ProcurementFunctionArgs.uuid(args, 1);
        FileStorageResponse file = AppContext.tryGet(FileStorageService.class).get(fileId);

        request.setPackageId(packageId);
        request.setFileId(fileId);
        request.setFileName(resolveFileName(file));
        request.setUploadedAt(OffsetDateTime.now());

        return AppContext.tryGet(ProcurementKpDocumentService.class).create(request);
    }

    private String resolveFileName(FileStorageResponse file) {
        if (file == null) {
            return null;
        }
        if (file.getOriginalFileName() != null && !file.getOriginalFileName().isBlank()) {
            return file.getOriginalFileName();
        }
        return file.getFileName();
    }
}
