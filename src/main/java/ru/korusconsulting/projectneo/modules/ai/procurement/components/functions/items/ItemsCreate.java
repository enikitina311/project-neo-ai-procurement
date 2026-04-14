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
public class ItemsCreate extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__items_create";
    }

    @Override
    public String description() {
        return "Create procurement item: package_id, name, specs?, qty?, unit?";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 2, "Expected at least 2 arguments: package_id, name");

        ProcurementItemDtoRequest request = new ProcurementItemDtoRequest();
        request.setPackageId(ProcurementFunctionArgs.uuid(args, 0));
        request.setName(ProcurementFunctionArgs.string(args, 1));
        request.setSpecs(ProcurementFunctionArgs.optionalString(args, 2));
        request.setQty(ProcurementFunctionArgs.optionalDouble(args, 3));
        request.setUnit(ProcurementFunctionArgs.optionalString(args, 4));

        return AppContext.tryGet(ProcurementItemService.class).create(request);
    }
}
