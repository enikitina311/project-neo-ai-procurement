package ru.korusconsulting.projectneo.modules.ai.procurement.services.support;

import java.util.UUID;

import ru.korusconsulting.projectneo.core.common.utils.ObjectExtensions;
import ru.korusconsulting.projectneo.core.component.base.ComponentArgs;

public final class ProcurementFunctionArgs {
    private ProcurementFunctionArgs() {
    }

    public static void requireMinArgs(ComponentArgs args, int minArgs, String errorMessage) {
        if (args == null || args.values == null || args.values.size() < minArgs) {
            throw new IllegalArgumentException(errorMessage);
        }
    }

    public static UUID uuid(ComponentArgs args, int index) {
        return ObjectExtensions.toUuidSafe(args.values.get(index));
    }

    public static String string(ComponentArgs args, int index) {
        return ObjectExtensions.toStringSafe(args.values.get(index));
    }

    public static String optionalString(ComponentArgs args, int index) {
        if (args.values.size() <= index) {
            return null;
        }
        return ObjectExtensions.toStringSafe(args.values.get(index));
    }

    public static Double optionalDouble(ComponentArgs args, int index) {
        if (args.values.size() <= index) {
            return null;
        }

        String value = ObjectExtensions.toStringSafe(args.values.get(index));
        if (value == null || value.isBlank()) {
            return null;
        }

        return ObjectExtensions.toDoubleSafe(value);
    }

    public static double doubleOrDefault(ComponentArgs args, int index, double defaultValue) {
        if (args.values.size() <= index) {
            return defaultValue;
        }
        return ObjectExtensions.toDoubleSafe(args.values.get(index), defaultValue);
    }

    public static Integer optionalInt(ComponentArgs args, int index) {
        if (args.values.size() <= index) {
            return null;
        }

        String value = ObjectExtensions.toStringSafe(args.values.get(index));
        if (value == null || value.isBlank()) {
            return null;
        }

        return ObjectExtensions.toIntSafe(value);
    }

    public static int intOrDefault(ComponentArgs args, int index, int defaultValue) {
        if (args.values.size() <= index) {
            return defaultValue;
        }
        return ObjectExtensions.toIntSafe(args.values.get(index), defaultValue);
    }

    public static boolean boolOrDefault(ComponentArgs args, int index, boolean defaultValue) {
        if (args.values.size() <= index) {
            return defaultValue;
        }
        return ObjectExtensions.toBoolSafe(args.values.get(index));
    }
}
