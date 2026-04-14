package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.suppliers;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplierService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.request.ProcurementSupplierDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementFunctionArgs;

@Extension
public class SupplierAddManual extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__supplier_add_manual";
    }

    @Override
    public String description() {
        return "Add supplier: package_id, name, url?, email?, price?, unit?, note?, selected?, coverage_count?, coverage_ratio?, matched_items_json?, origin?";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 2, "Expected at least 2 arguments: package_id, name");

        ProcurementSupplierDtoRequest request = new ProcurementSupplierDtoRequest();
        request.setPackageId(ProcurementFunctionArgs.uuid(args, 0));
        request.setName(ProcurementFunctionArgs.string(args, 1));
        request.setUrl(ProcurementFunctionArgs.optionalString(args, 2));
        request.setEmail(ProcurementFunctionArgs.optionalString(args, 3));
        request.setPrice(ProcurementFunctionArgs.optionalDouble(args, 4));
        request.setUnit(ProcurementFunctionArgs.optionalString(args, 5));
        request.setNote(ProcurementFunctionArgs.optionalString(args, 6));
        request.setSelected(ProcurementFunctionArgs.boolOrDefault(args, 7, true));
        Integer coverageCount = ProcurementFunctionArgs.optionalInt(args, 8);
        if (coverageCount != null) {
            request.setCoverageCount(coverageCount > 0 ? coverageCount : null);
        }
        Double ratio = ProcurementFunctionArgs.optionalDouble(args, 9);
        if (ratio != null) {
            request.setCoverageRatio(ratio > 0 ? ratio : null);
        }
        String matched = ProcurementFunctionArgs.optionalString(args, 10);
        if (matched != null) {
            request.setMatchedItemsJson(matched.isBlank() ? null : matched);
        }
        String origin = ProcurementFunctionArgs.optionalString(args, 11);
        if (origin == null) {
            origin = "manual";
        }
        request.setOrigin(origin.isBlank() ? "manual" : origin);

        return AppContext.tryGet(ProcurementSupplierService.class).create(request);
    }
}
