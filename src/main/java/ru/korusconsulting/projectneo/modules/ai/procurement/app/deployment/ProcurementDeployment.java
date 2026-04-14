package ru.korusconsulting.projectneo.modules.ai.procurement.app.deployment;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ru.korusconsulting.projectneo.core.services.database.DatabaseService;
import ru.korusconsulting.projectneo.core.services.provision.ProvisionService;
import ru.korusconsulting.projectneo.core.services.systemorchestrator.SystemOrchestratorService;
import ru.korusconsulting.projectneo.core.services.systemorchestrator.configuration.dto.request.EnsureServiceConfigurationRequest;
import ru.korusconsulting.projectneo.core.services.systemorchestrator.dto.request.EnsureServiceRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.Const;
import ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration.ProcurementModule;
import ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration.ProcurementSettings;

/**
 * Класс для развертывания и конфигурации модуля Procurement AI.
 * Отвечает за инициализацию базы данных, создание таблиц и настройку
 * конфигурации.
 */
public class ProcurementDeployment {

    private static final Logger log = LoggerFactory.getLogger(ProcurementDeployment.class);

    private final DatabaseService databaseService;
    private final SystemOrchestratorService systemOrchestratorService;
    private final ProvisionService provisionService;
    private final ProcurementModule moduleConfig;
    private final ClassLoader classLoader;

    public ProcurementDeployment(
            DatabaseService databaseService,
            SystemOrchestratorService systemOrchestratorService,
            ProvisionService provisionService,
            ProcurementModule moduleConfig,
            ClassLoader classLoader) {
        this.databaseService = databaseService;
        this.systemOrchestratorService = systemOrchestratorService;
        this.provisionService = provisionService;
        this.moduleConfig = moduleConfig;
        this.classLoader = classLoader;
    }

    public void setup() {
        log.info("========================================");
        log.info("Starting Procurement AI module deployment");
        log.info("========================================");

        try {
            if (moduleConfig == null) {
                log.warn("No module configurations found, skipping provisioning");
                return;
            }

            provisionDatabase();
            initializeConfiguration();

            log.info("✓ Procurement AI module deployment completed successfully");
            log.info("========================================");

        } catch (Exception e) {
            log.error("✗ Failed to deploy Procurement AI module", e);
            throw new RuntimeException("Procurement AI module deployment failed", e);
        }
    }

    private void provisionDatabase() {
        log.info("Provisioning Procurement database schema using module.yml configuration...");

        try {
            if (moduleConfig.getDatabase() == null || moduleConfig.getDatabase().isEmpty()) {
                log.warn("No database configurations found in module.yml, skipping database provisioning");
                return;
            }

            log.info("Found {} database configuration(s) in module.yml", moduleConfig.getDatabase().size());

            provisionService.provision(moduleConfig, classLoader);

            log.info("✓ Database schema provisioned successfully");
        } catch (Exception e) {
            log.error("Failed to provision database schema", e);
            throw new RuntimeException("Database schema provisioning failed", e);
        }
    }

    private void initializeConfiguration() {
        log.info("Initializing Procurement AI configuration...");

        try {
            EnsureServiceConfigurationRequest serviceConfiguration = EnsureServiceConfigurationRequest
                    .builder()
                    .name(Const.CONFIGURATION_KEY)
                    .valueJson(new ProcurementSettings().toJson())
                    .displayName(Const.CONFIG_DISPLAY_NAME_CONFIGURATION)
                    .build();

            EnsureServiceConfigurationRequest image = EnsureServiceConfigurationRequest
                    .builder()
                    .name(Const.CONFIG_KEY_IMAGE)
                    .valueJson("{\"value\": \"" + Const.DEFAULT_IMAGE_VALUE + "\"}")
                    .displayName(Const.CONFIG_DISPLAY_NAME_IMAGE)
                    .build();

            List<EnsureServiceConfigurationRequest> configurations = new ArrayList<>();
            configurations.add(serviceConfiguration);
            configurations.add(image);

            EnsureServiceRequest service = EnsureServiceRequest.builder()
                    .displayName(Const.SERVICE_DISPLAY_NAME)
                    .name(Const.SERVICE_NAME)
                    .enabled(true)
                    .configuration(configurations)
                    .build();

            this.systemOrchestratorService.registerService(service);

            log.info("✓ Configuration initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize configuration", e);
            log.warn("⚠ Configuration initialization skipped");
        }
    }

    public boolean healthCheck() {
        log.info("Running Procurement AI module health check...");

        try {
            if (databaseService == null) {
                log.error("DatabaseService is not available");
                return false;
            }

            log.info("✓ Health check passed");
            return true;

        } catch (Exception e) {
            log.error("Health check failed", e);
            return false;
        }
    }
}
