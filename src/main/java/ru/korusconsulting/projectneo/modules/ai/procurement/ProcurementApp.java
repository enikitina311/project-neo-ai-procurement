package ru.korusconsulting.projectneo.modules.ai.procurement;

import org.pf4j.PluginWrapper;
import org.springframework.context.ApplicationContext;

import lombok.extern.slf4j.Slf4j;
import ru.korusconsulting.projectneo.core.app.context.AppContext;
import ru.korusconsulting.projectneo.core.component.solution.BaseSolution;
import ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration.ProcurementConfiguration;
import ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration.ProcurementModule;
import ru.korusconsulting.projectneo.modules.ai.procurement.app.deployment.ProcurementDeployment;

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

        ProcurementModule moduleConfig = AppContext.tryGet(ProcurementModule.class);
        log.info("Procurement module config resolved: {}", moduleConfig != null);
        if (moduleConfig != null && moduleConfig.getDatabase() != null) {
            log.info("Procurement module database configs: {}", moduleConfig.getDatabase().size());
        }

        new ProcurementDeployment(
                this.appConfig.getDatabaseService(),
                this.host,
                moduleConfig,
                this.getClass().getClassLoader()).setup();

        log.info("Procurement AI module initialized successfully");
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
