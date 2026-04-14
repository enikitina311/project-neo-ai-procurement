package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.suppliers;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplierService;

@Extension
public class SupplierSelect extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__supplier_select";
    }

    @Override
    public String description() {
        return "Select supplier for package: supplier_id, selected";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.size() < 2) {
            throw new IllegalArgumentException("Expected 2 arguments: supplier_id, selected");
        }

        return AppContext.tryGet(ProcurementSupplierService.class)
            .updateSelected(ObjectExtensions.toUuidSafe(args.values.get(0)), ObjectExtensions.toBoolSafe(args.values.get(1)));
    }
}
