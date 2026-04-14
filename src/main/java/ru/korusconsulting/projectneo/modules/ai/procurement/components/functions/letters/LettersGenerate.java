package ru.korusconsulting.projectneo.modules.ai.procurement.components.functions.letters;

import java.util.List;
import java.util.UUID;

import org.pf4j.Extension;

import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunction;
import ru.korusconsulting.projectneo.core.expressions.data.DataFunctionBase;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.response.ProcurementLetterDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows.ProcurementLettersWorkflow;

@Extension
public class LettersGenerate extends DataFunctionBase implements DataFunction {
    @Override
    public String name() {
        return "korus_ai_procurement__letters_generate";
    }

    @Override
    public String description() {
        return "Generate supplier letters via n8n: package_id";
    }

    @Override
    public Object execute(ComponentArgs args) {
        if (args.values.isEmpty()) {
            throw new IllegalArgumentException("Expected 1 argument: package_id");
        }

        UUID packageId = UUID.fromString(args.values.get(0).toString());
        return AppContext.tryGet(ProcurementLettersWorkflow.class).generate(packageId);
    }
}
