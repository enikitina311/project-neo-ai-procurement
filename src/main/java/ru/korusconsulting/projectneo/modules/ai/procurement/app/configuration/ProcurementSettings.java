package ru.korusconsulting.projectneo.modules.ai.procurement.app.configuration;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.korusconsulting.projectneo.core.common.annotation.configuration.ConfigurationSettings;
import ru.korusconsulting.projectneo.core.common.utils.StringExtensions;
import ru.korusconsulting.projectneo.modules.ai.procurement.Const;

import java.util.HashMap;
import java.util.Map;

/**
 * Класс для хранения настроек компонента Procurement AI.
 * Содержит имя компонента и мапу его аргументов (методов).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@ConfigurationSettings(
    value = Const.CONFIGURATION_KEY,
    description = "Конфигурация компонента Procurement AI с методами и параметрами"
)
public class ProcurementSettings {

    @JsonProperty("componentName")
    private String componentName = Const.COMPONENT_NAME;

    @JsonProperty("componentArgs")
    private Map<String, String> componentArgs = init();

    private static Map<String, String> init() {
        return new HashMap<>();
    }

    public String getArg(String key) {
        return componentArgs.get(key);
    }

    public void setArg(String key, String value) {
        if (this.componentArgs == null) {
            this.componentArgs = new HashMap<>();
        }
        this.componentArgs.put(key, value);
    }

    public String toJson() throws JsonProcessingException {
        return StringExtensions.toJson(this, true);
    }

    @Override
    public String toString() {
        try {
            return this.toJson();
        } catch (JsonProcessingException e) {
            return "";
        }
    }
}
