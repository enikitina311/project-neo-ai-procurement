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
public class PackageUpdate extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__package_update";
    }

    @Override
    public String description() {
        return "Update procurement package: id, workspace_id, name, criteria_text?, coverage_threshold?, suppliers_limit?";
    }

    @Override
    public Object execute(ComponentArgs args) {
        ProcurementFunctionArgs.requireMinArgs(args, 3, "Expected at least 3 arguments: id, workspace_id, name");

        ProcurementPackageDtoRequest request = new ProcurementPackageDtoRequest();
        request.setId(ProcurementFunctionArgs.uuid(args, 0));
        request.setWorkspaceId(ProcurementFunctionArgs.uuid(args, 1));
        request.setName(ProcurementFunctionArgs.string(args, 2));
        request.setCriteriaText(ProcurementFunctionArgs.optionalString(args, 3));
        request.setCoverageThreshold(ProcurementFunctionArgs.doubleOrDefault(args, 4, 0.7));
        request.setSuppliersLimit(ProcurementFunctionArgs.intOrDefault(args, 5, 10));

        return AppContext.tryGet(ProcurementPackageService.class).update(request);
    }
}
