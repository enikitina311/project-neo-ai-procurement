package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.kp;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocumentService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementFunctionArgs;

@Extension
public class KpDelete extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__kp_delete";
    }

    @Override
    public String description() {
        return "Delete KP document: id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 1, "Expected 1 argument: id");

        AppContext.tryGet(ProcurementKpDocumentService.class)
            .deleteById(ProcurementFunctionArgs.uuid(args, 0));
        return true;
    }
}
