package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.packages;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageService;

@Extension
public class PackageGet extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__package_get";
    }

    @Override
    public String description() {
        return "Get procurement package by id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.isEmpty()) {
            throw new IllegalArgumentException("Expected 1 argument: package_id");
        }

        return AppContext.tryGet(ProcurementPackageService.class)
            .get(ObjectExtensions.toUuidSafe(args.values.get(0)));
    }
}
