package ru.korusconsulting.projectneo.modules.ai.procurement.services.support;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ru.korusconsulting.projectneo.core.common.utils.StringExtensions;
import ru.korusconsulting.projectneo.core.services.configuration.dto.response.CoreConfigurationResponse;
import ru.korusconsulting.projectneo.core.services.configuration.base.BaseConfigurationService;
import ru.korusconsulting.projectneo.core.services.n8n.entities.N8nConfig;
import ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration.ProcurementConfiguration;

@Service
public class ProcurementN8nConfigProvider {
    private static final String CONFIG_NAME = "N8NHostUrl";

    private final ProcurementConfiguration procurementConfiguration;

    @Autowired
    public ProcurementN8nConfigProvider(ProcurementConfiguration procurementConfiguration) {
        this.procurementConfiguration = procurementConfiguration;
    }

    public N8nConfig loadConfig() {
        BaseConfigurationService<CoreConfigurationResponse> configurationService =
            procurementConfiguration.getConfigurationService();
        if (configurationService == null) {
            throw new IllegalStateException("Core configuration service is not available for procurement module");
        }

        CoreConfigurationResponse configResponse = configurationService.getByName(CONFIG_NAME);
        if (configResponse == null || StringExtensions.isNullOrEmpty(configResponse.getValueJson())) {
            throw new IllegalStateException("Configuration '" + CONFIG_NAME + "' is not defined");
        }

        N8nConfig config = StringExtensions.fromJson(configResponse.getValueJson(), N8nConfig.class);
        if (config == null) {
            throw new IllegalStateException("Configuration '" + CONFIG_NAME + "' has invalid JSON format");
        }

        return config;
    }
}
