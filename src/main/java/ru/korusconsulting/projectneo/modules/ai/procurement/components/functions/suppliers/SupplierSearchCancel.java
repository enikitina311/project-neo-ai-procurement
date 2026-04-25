package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.suppliers;

import java.util.UUID;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.controllers.context.ApiRequestContext;
import ru.korusconsulting.projectneo.core.common.controllers.context.ApiRequestContextHolder;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementFunctionArgs;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows.ProcurementSupplierSearchWorkflow;

@Extension
public class SupplierSearchCancel extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__supplier_search_cancel";
    }

    @Override
    public String description() {
        return "Cancel async supplier search: search_run_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 1, "Expected 1 argument: search_run_id");

        ApiRequestContext context = ApiRequestContextHolder.getContext();
        UUID userId = context != null ? context.getUserId() : null;

        return AppContext.tryGet(ProcurementSupplierSearchWorkflow.class)
            .cancelSearch(ProcurementFunctionArgs.uuid(args, 0), userId);
    }
}
