package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.suppliers;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementFunctionArgs;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows.ProcurementSupplierSearchWorkflow;

@Extension
public class SupplierSearchStatus extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__supplier_search_status";
    }

    @Override
    public String description() {
        return "Get async supplier search status: search_run_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 1, "Expected 1 argument: search_run_id");

        return AppContext.tryGet(ProcurementSupplierSearchWorkflow.class)
            .getSearchStatus(ProcurementFunctionArgs.uuid(args, 0));
    }
}
