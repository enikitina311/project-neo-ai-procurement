package ru.korusconsulting.projectneo.modules.ai.procurement;

import java.util.List;

import org.pf4j.PluginWrapper;
import org.springframework.context.ApplicationContext;

import lombok.extern.slf4j.Slf4j;
import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.solution.BaseSolution;
import ru.korusconsulting.projectneo.core.services.systemorchestrator.configuration.dto.request.EnsureServiceConfigurationRequest;
import ru.korusconsulting.projectneo.core.services.systemorchestrator.dto.request.EnsureServiceRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration.ProcurementConfiguration;
import ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration.ProcurementSettings;

@Slf4j
public class ProcurementApp extends BaseSolution {

    private ProcurementConfiguration appConfig;
    private ApplicationContext pluginContext;

    public ProcurementApp(PluginWrapper wrapper) {
        super(wrapper);
    }

    @Override
    public void start() {
        super.start();
        log.info("Procurement AI service started V0.1");
    }

    @Override
    protected void onInitialize() {
        this.pluginContext = this.createApplicationContext();
        AppContext.registerPluginContext(this.pluginContext);

        this.appConfig = this.host.configLoader().getPluginConfig(this.pluginContext, ProcurementConfiguration.class);

        // Phase 14 Group C: migrations now flow through ProcurementServiceModule.migrations()
        // (run by ServiceModuleRegistry before this hook). Only the runtime registration
        // of the procurement service in core.services lives here.
        registerProcurementService();
    }

    /**
     * Phase 14 Group C: registers the procurement service entry + its two default
     * configurations in core.services. Was {@code ProcurementDeployment.initializeConfiguration}.
     */
    private void registerProcurementService() {
        try {
            EnsureServiceConfigurationRequest serviceConfiguration = EnsureServiceConfigurationRequest.builder()
                    .name(Const.CONFIGURATION_KEY)
                    .valueJson(new ProcurementSettings().toJson())
                    .displayName(Const.CONFIG_DISPLAY_NAME_CONFIGURATION)
                    .build();

            EnsureServiceConfigurationRequest image = EnsureServiceConfigurationRequest.builder()
                    .name(Const.CONFIG_KEY_IMAGE)
                    .valueJson("{\"value\": \"" + Const.DEFAULT_IMAGE_VALUE + "\"}")
                    .displayName(Const.CONFIG_DISPLAY_NAME_IMAGE)
                    .build();

            EnsureServiceRequest service = EnsureServiceRequest.builder()
                    .displayName(Const.SERVICE_DISPLAY_NAME)
                    .name(Const.SERVICE_NAME)
                    .enabled(true)
                    .configuration(List.of(serviceConfiguration, image))
                    .build();

            this.host.lifecycle().registerService(service);
            log.info("Procurement service registered in core.services");
        } catch (Exception e) {
            log.error("Failed to register procurement service in core.services — admin UI may not list it", e);
        }
    }

    @Override
    public void stop() {
        log.info("Procurement AI service stopped");
        if (this.pluginContext != null) {
            AppContext.unregisterPluginContext(this.pluginContext);
        }
        super.stop();
    }
}
