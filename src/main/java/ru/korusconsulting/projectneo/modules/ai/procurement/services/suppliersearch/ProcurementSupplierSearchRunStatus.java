package ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliersearch;

public enum ProcurementSupplierSearchRunStatus {
    CREATED("created"),
    RUNNING("running"),
    COMPLETED("completed"),
    FAILED("failed"),
    CANCEL_REQUESTED("cancel_requested"),
    CANCELLED("cancelled");

    private final String value;

    ProcurementSupplierSearchRunStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED || this == CANCELLED;
    }

    public static ProcurementSupplierSearchRunStatus fromValue(String value) {
        if (value == null || value.isBlank()) {
            return CREATED;
        }

        for (ProcurementSupplierSearchRunStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Unknown supplier search run status: " + value);
    }
}
