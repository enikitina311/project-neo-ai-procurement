package ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import ru.korusconsulting.projectneo.core.services.configuration.base.BaseConfigurationService;
import ru.korusconsulting.projectneo.core.services.configuration.dto.response.CoreConfigurationResponse;
import ru.korusconsulting.projectneo.core.services.database.DatabaseService;

@Configuration
@EnableScheduling
@ComponentScan(basePackages = "ru.korusconsulting.projectneo.modules.ai.procurement")
public class ProcurementConfiguration {

    private DatabaseService databaseService;
    private BaseConfigurationService<CoreConfigurationResponse> configurationService;

    @Bean
    public ProcurementSettings procurementSettings() {
        return new ProcurementSettings();
    }

    @Autowired(required = false)
    public void setDatabaseService(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @Autowired(required = false)
    public void setConfigurationService(BaseConfigurationService<CoreConfigurationResponse> configurationService) {
        this.configurationService = configurationService;
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
}
