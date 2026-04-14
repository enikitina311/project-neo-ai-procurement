package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.kp;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysisService;

@Extension
public class KpAnalysisGet extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__kp_analysis_get";
    }

    @Override
    public String description() {
        return "Get KP analysis by kp_document_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.isEmpty()) {
            throw new IllegalArgumentException("Expected 1 argument: kp_document_id");
        }

        return AppContext.tryGet(ProcurementKpAnalysisService.class)
            .findByKpDocumentId(ObjectExtensions.toUuidSafe(args.values.get(0)));
    }
}
