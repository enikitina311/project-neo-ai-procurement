package ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.yaml.snakeyaml.Yaml;

import ru.korusconsulting.projectneo.core.common.support.YamlPropertySourceFactory;
import ru.korusconsulting.projectneo.core.services.configuration.base.BaseConfigurationService;
import ru.korusconsulting.projectneo.core.services.configuration.dto.response.CoreConfigurationResponse;
import ru.korusconsulting.projectneo.core.services.database.DatabaseService;
import ru.korusconsulting.projectneo.core.services.provision.ProvisionService;
import ru.korusconsulting.projectneo.core.services.provision.config.DatabaseConfig;
import ru.korusconsulting.projectneo.core.services.systemorchestrator.SystemOrchestratorService;
import ru.korusconsulting.projectneo.core.services.workspace.project.ProjectService;
import ru.korusconsulting.projectneo.core.services.workspace.project.theme.WorkspaceThemeService;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
@EnableScheduling
@ComponentScan(basePackages = "ru.korusconsulting.projectneo.modules.ai.procurement")
@PropertySource(value = "classpath:config/module.yml", factory = YamlPropertySourceFactory.class)
public class ProcurementConfiguration {

    public ProcurementConfiguration() {
        log.debug("ProcurementConfiguration constructor called");
    }

    private DatabaseService databaseService;
    private BaseConfigurationService<CoreConfigurationResponse> configurationService;
    private SystemOrchestratorService systemOrchestratorService;
    private ProjectService projectService;
    private WorkspaceThemeService projectThemeService;
    private ProvisionService provisionService;

    @Bean
    public ProcurementSettings procurementSettings() {
        return new ProcurementSettings();
    }

    @Bean
    public ProcurementModule procurementModule() {
        log.debug("Creating ProcurementModule bean");
        try {
            ClassLoader classLoader = this.getClass().getClassLoader();
            InputStream inputStream = classLoader.getResourceAsStream("config/module.yml");

            if (inputStream == null) {
                log.warn("module.yml not found in classpath");
                return new ProcurementModule();
            }

            Yaml yaml = new Yaml();
            Map<String, Object> data = yaml.load(inputStream);
            log.debug("Loaded procurement module yaml");

            ProcurementModule config = new ProcurementModule();

            if (data != null && data.containsKey("module")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> moduleData = (Map<String, Object>) data.get("module");

                if (moduleData != null && moduleData.containsKey("database")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> databaseList = (List<Map<String, Object>>) moduleData.get("database");

                    List<DatabaseConfig> dbConfigs = new java.util.ArrayList<>();

                    for (Map<String, Object> dbData : databaseList) {
                        DatabaseConfig dbConfig = new DatabaseConfig();

                        dbConfig.setName((String) dbData.get("name"));
                        dbConfig.setPath((String) dbData.get("path"));
                        dbConfig.setDescription((String) dbData.get("description"));
                        dbConfig.setEnabled((Boolean) dbData.getOrDefault("enabled", true));
                        dbConfig.setOrder((Integer) dbData.getOrDefault("order", 0));

                        dbConfigs.add(dbConfig);
                    }

                    config.setDatabase(dbConfigs);
                }
            }

            log.info(
                "ProcurementModule bean created with {} database config(s)",
                config.getDatabase() != null ? config.getDatabase().size() : 0);
            return config;
        } catch (Exception e) {
            log.error("Failed to load ProcurementModule", e);
            return new ProcurementModule();
        }
    }

    @Autowired(required = false)
    public void setDatabaseService(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @Autowired(required = false)
    public void setConfigurationService(BaseConfigurationService<CoreConfigurationResponse> configurationService) {
        this.configurationService = configurationService;
    }

    @Autowired(required = false)
    public void setSystemOrchestratorService(SystemOrchestratorService systemOrchestratorService) {
        this.systemOrchestratorService = systemOrchestratorService;
    }

    @Autowired(required = false)
    public void setProvisionService(ProvisionService provisionService) {
        this.provisionService = provisionService;
    }

    @Autowired(required = false)
    public void setProjectService(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Autowired(required = false)
    public void setWorkspaceThemeService(WorkspaceThemeService projectThemeService) {
        this.projectThemeService = projectThemeService;
    }

    public ProcurementSettings getProcurementSettings() {
        return procurementSettings();
    }

    public DatabaseService getDatabaseService() {
        return databaseService;
    }

    public BaseConfigurationService<CoreConfigurationResponse> getConfigurationService() {
        return this.configurationService;
    }

    public SystemOrchestratorService getSystemOrchestratorService() {
        return this.systemOrchestratorService;
    }

    public ProvisionService getProvisionService() {
        return provisionService;
    }

    public ProjectService getProjectService() {
        return projectService;
    }

    public WorkspaceThemeService getWorkspaceThemeService() {
        return projectThemeService;
    }
}
