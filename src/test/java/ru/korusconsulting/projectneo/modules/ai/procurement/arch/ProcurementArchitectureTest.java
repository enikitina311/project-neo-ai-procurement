package ru.korusconsulting.projectneo.modules.ai.procurement.arch;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import com.tngtech.archunit.base.DescribedPredicate;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import ru.korusconsulting.projectneo.sdk.arch.PluginPublicApiContract;

/**
 * Architecture invariants for the procurement plugin.
 *
 * <ul>
 *   <li>Phase 2.4: procurement does not depend on other plugins.
 *   <li>Phase 14 Group F: procurement does not bypass {@code PluginHostServices}
 *       to reach internal core service implementations.
 * </ul>
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

    private static final Set<String> FORBIDDEN_FQNS =
        Arrays.stream(PluginPublicApiContract.FORBIDDEN_CORE_SERVICES).collect(Collectors.toSet());

    private static final DescribedPredicate<JavaClass> FORBIDDEN_CORE_SERVICE =
        new DescribedPredicate<>("an internal core service plugins must reach via PluginHostServices facade") {
            @Override
            public boolean test(JavaClass javaClass) {
                return FORBIDDEN_FQNS.contains(javaClass.getFullName());
            }
        };

    @ArchTest
    static final ArchRule procurement_uses_host_facade_not_internal_core_services =
        noClasses()
            .that().resideInAPackage("ru.korusconsulting.projectneo.modules.ai.procurement..")
            .should().dependOnClassesThat(FORBIDDEN_CORE_SERVICE)
            .as("plugin must use core.services.host.PluginHostServices facade "
                + "instead of injecting internal core service implementations directly "
                + "(Phase 14 Group B)");
}
