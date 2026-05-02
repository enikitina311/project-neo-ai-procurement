package ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration;

import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

import ru.korusconsulting.projectneo.sdk.assistant.AssistantTool;
import ru.korusconsulting.projectneo.sdk.module.ProjectCategory;
import ru.korusconsulting.projectneo.sdk.module.ProvisioningContext;
import ru.korusconsulting.projectneo.sdk.module.ServiceDependency;
import ru.korusconsulting.projectneo.sdk.module.ServiceModule;
import ru.korusconsulting.projectneo.sdk.module.ServiceScope;

/**
 * Phase 2.3 declarative manifest for the procurement plugin.
 * See {@link ServiceModule}; metadata-only today.
 */
@Component
public class ProcurementServiceModule implements ServiceModule {

    @Override
    public String name() {
        return "procurement";
    }

    @Override
    public String displayName() {
        return "Procurement";
    }

    @Override
    public String version() {
        return "0.4.0";
    }

    @Override
    public String requiredCoreVersion() {
        // Phase 9.E: requires plugin-sdk method names renamed Workspace → Project.
        return ">=0.16.0";
    }

    @Override
    public List<ServiceDependency> requires() {
        return List.of();
    }

    @Override
    public List<ServiceDependency> optional() {
        return List.of();
    }

    @Override
    public ServiceScope scope() {
        return ServiceScope.WORKSPACE;
    }

    @Override
    public Set<ProjectCategory> applicableCategories() {
        return EnumSet.of(ProjectCategory.PROJECT, ProjectCategory.AREA);
    }

    @Override
    public String dbSchema() {
        return "procurement";
    }

    @Override
    public List<String> migrations() {
        return Collections.emptyList();
    }

    @Override
    public List<AssistantTool> tools() {
        return Collections.emptyList();
    }

    @Override
    public void onProjectServiceEnabled(ProvisioningContext ctx) {
    }

    @Override
    public void onProjectServiceDisabled(ProvisioningContext ctx) {
    }
}
