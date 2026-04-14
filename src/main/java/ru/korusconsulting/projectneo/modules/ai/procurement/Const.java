package ru.korusconsulting.projectneo.modules.ai.procurement;

/**
 * Константы модуля Procurement AI.
 * Централизованное хранилище всех строковых констант используемых в модуле.
 */
public class Const {

    // ========== Component Names ==========
    /** Имя компонента в системе */
    public static final String COMPONENT_NAME = "korus_ai_procurement__component";

    /** Имя сервиса в системе */
    public static final String SERVICE_NAME = "korus_ai_procurement";

    /** Отображаемое имя сервиса */
    public static final String SERVICE_DISPLAY_NAME = "Ассистент закупок";

    // ========== Configuration Keys ==========
    /** Ключ конфигурации для основных настроек */
    public static final String CONFIGURATION_KEY = "ProcurementConfiguration";

    /** Ключ конфигурации для изображения */
    public static final String CONFIG_KEY_IMAGE = "Image";

    // ========== Configuration Display Names ==========
    /** Отображаемое имя конфигурации сервиса */
    public static final String CONFIG_DISPLAY_NAME_CONFIGURATION = "Конфигурация сервиса";

    /** Отображаемое имя изображения */
    public static final String CONFIG_DISPLAY_NAME_IMAGE = "Изображение";

    // ========== Default Values ==========
    /** Значение по умолчанию для изображения */
    public static final String DEFAULT_IMAGE_VALUE = "default";

    private Const() {
        // Приватный конструктор для предотвращения инстанциирования
    }
}
