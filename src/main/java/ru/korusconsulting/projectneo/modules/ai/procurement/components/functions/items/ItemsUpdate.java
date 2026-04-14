package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.items;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItemService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.request.ProcurementItemDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementFunctionArgs;

@Extension
public class ItemsUpdate extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__items_update";
    }

    @Override
    public String description() {
        return "Update procurement item: id, package_id, name, specs?, qty?, unit?";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 3, "Expected at least 3 arguments: id, package_id, name");

        ProcurementItemDtoRequest request = new ProcurementItemDtoRequest();
        request.setId(ProcurementFunctionArgs.uuid(args, 0));
        request.setPackageId(ProcurementFunctionArgs.uuid(args, 1));
        request.setName(ProcurementFunctionArgs.string(args, 2));
        request.setSpecs(ProcurementFunctionArgs.optionalString(args, 3));
        request.setQty(ProcurementFunctionArgs.optionalDouble(args, 4));
        request.setUnit(ProcurementFunctionArgs.optionalString(args, 5));

        return AppContext.tryGet(ProcurementItemService.class).update(request);
    }
}
