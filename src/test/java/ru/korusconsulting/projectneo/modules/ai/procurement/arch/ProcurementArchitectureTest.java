package ru.korusconsulting.projectneo.modules.ai.procurement.arch;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * Phase 2.4 — architecture invariants for the procurement plugin.
 *
 * <p>Plugins must remain isolated from each other. A self-hosted client
 * may enable any subset of plugins; a procurement → tsa import would silently
 * break tsa-disabled deployments.
 */
@AnalyzeClasses(
    packages = "ru.korusconsulting.projectneo.modules.ai.procurement",
    importOptions = ImportOption.DoNotIncludeTests.class
)
class ProcurementArchitectureTest {

    @ArchTest
    static final ArchRule procurement_does_not_depend_on_other_plugins =
        noClasses()
            .that().resideInAPackage("ru.korusconsulting.projectneo.modules.ai.procurement..")
            .should().dependOnClassesThat().resideInAnyPackage(
                "ru.korusconsulting.projectneo.modules.ai.meetings..",
                "ru.korusconsulting.projectneo.modules.ai.requirements..",
                "ru.korusconsulting.projectneo.modules.ai.technicalspecanalysis..");
}
