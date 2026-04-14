package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.suppliers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows.ProcurementSupplierSearchWorkflow;

@Extension
public class SupplierSearch extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__supplier_search";
    }

    @Override
    public String description() {
        return "Search suppliers via n8n: package_id, query?";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.isEmpty()) {
            throw new IllegalArgumentException("Expected at least 1 argument: package_id or item");
        }

        boolean isPackageSearch = ObjectExtensions.isUuid(args.values.get(0));
        ProcurementSupplierSearchWorkflow workflow = AppContext.tryGet(ProcurementSupplierSearchWorkflow.class);
        if (isPackageSearch) {
            return workflow.searchByPackage(
                ObjectExtensions.toUuidSafe(args.values.get(0)),
                args.values.size() > 1 ? ObjectExtensions.toStringSafe(args.values.get(1)) : null);
        }

        return workflow.searchByItem(ObjectExtensions.toStringSafe(args.values.get(0)));
    }
}
