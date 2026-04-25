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
public class SupplierSearchStart extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__supplier_search_start";
    }

    @Override
    public String description() {
        return "Start async supplier search: package_id, query?";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 1, "Expected at least 1 argument: package_id");

        ApiRequestContext context = ApiRequestContextHolder.getContext();
        UUID userId = context != null ? context.getUserId() : null;
        if (userId == null) {
            throw new IllegalStateException("Current user is not available for supplier search");
        }

        return AppContext.tryGet(ProcurementSupplierSearchWorkflow.class)
            .startSearchByPackage(
                ProcurementFunctionArgs.uuid(args, 0),
                ProcurementFunctionArgs.optionalString(args, 1),
                userId
            );
    }
}
