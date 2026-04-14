package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.kp;

import java.util.UUID;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response.ProcurementKpAnalysisDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows.ProcurementKpAnalysisWorkflow;

@Extension
public class KpAnalyze extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__kp_analyze";
    }

    @Override
    public String description() {
        return "Analyze KP document: kp_document_id, criteria_text?";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.isEmpty()) {
            throw new IllegalArgumentException("Expected 1 argument: kp_document_id");
        }

        UUID kpDocumentId = ObjectExtensions.toUuidSafe(args.values.get(0));
        String criteriaTextArg = args.values.size() > 1 ? ObjectExtensions.toStringSafe(args.values.get(1)) : null;
        return AppContext.tryGet(ProcurementKpAnalysisWorkflow.class).analyze(kpDocumentId, criteriaTextArg);
    }
}
