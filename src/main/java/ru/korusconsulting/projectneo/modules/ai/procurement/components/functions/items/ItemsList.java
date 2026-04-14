package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.items;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItemService;

@Extension
public class ItemsList extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__items_list";
    }

    @Override
    public String description() {
        return "List procurement items by package_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.isEmpty()) {
            throw new IllegalArgumentException("Expected 1 argument: package_id");
        }

        return AppContext.tryGet(ProcurementItemService.class)
            .listByPackageId(ObjectExtensions.toUuidSafe(args.values.get(0)));
    }
}
