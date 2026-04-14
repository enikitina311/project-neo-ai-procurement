package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.nmc;

import java.util.UUID;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.response.ProcurementNmcResultDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows.ProcurementNmcWorkflow;

@Extension
public class NmcGenerate extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__nmc_generate";
    }

    @Override
    public String description() {
        return "Generate NMC table: package_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.isEmpty()) {
            throw new IllegalArgumentException("Expected 1 argument: package_id");
        }

        UUID packageId = ObjectExtensions.toUuidSafe(args.values.get(0));
        return AppContext.tryGet(ProcurementNmcWorkflow.class).generate(packageId);
    }
}
