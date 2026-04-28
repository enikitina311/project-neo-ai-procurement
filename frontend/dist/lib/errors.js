export const handleApiError = (error) => (error instanceof Error ? error.message : String(error));
export function getProcurementErrorMessage(error, fallbackMessage) {
    const message = handleApiError(error);
    return message?.trim() ? message : fallbackMessage;
}
//# sourceMappingURL=errors.js.map