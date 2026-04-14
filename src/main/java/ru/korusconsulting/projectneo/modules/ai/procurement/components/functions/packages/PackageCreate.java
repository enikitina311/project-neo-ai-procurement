package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.packages;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.request.ProcurementPackageDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementFunctionArgs;

@Extension
public class PackageCreate extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__package_create";
    }

    @Override
    public String description() {
        return "Create procurement package: project_id, name, criteria_text?, coverage_threshold?, suppliers_limit?";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 2, "Expected at least 2 arguments: project_id, name");

        ProcurementPackageDtoRequest request = new ProcurementPackageDtoRequest();
        request.setProjectId(ProcurementFunctionArgs.uuid(args, 0));
        request.setName(ProcurementFunctionArgs.string(args, 1));
        request.setCriteriaText(ProcurementFunctionArgs.optionalString(args, 2));
        request.setCoverageThreshold(ProcurementFunctionArgs.doubleOrDefault(args, 3, 0.7));
        request.setSuppliersLimit(ProcurementFunctionArgs.intOrDefault(args, 4, 10));

        return AppContext.tryGet(ProcurementPackageService.class).create(request);
    }
}
