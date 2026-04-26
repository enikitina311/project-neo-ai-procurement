export const handleApiError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export function getProcurementErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  const message = handleApiError(error);
  return message?.trim() ? message : fallbackMessage;
}
