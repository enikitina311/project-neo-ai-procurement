package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.kp;

import java.util.UUID;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows.ProcurementKpAnalysisWorkflow;

@Extension
public class KpExtract extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__kp_extract";
    }

    @Override
    public String description() {
        return "Extract structured data from KP document: kp_document_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.isEmpty()) {
            throw new IllegalArgumentException("Expected 1 argument: kp_document_id");
        }

        UUID kpDocumentId = ObjectExtensions.toUuidSafe(args.values.get(0));
        return AppContext.tryGet(ProcurementKpAnalysisWorkflow.class).extract(kpDocumentId);
    }
}
