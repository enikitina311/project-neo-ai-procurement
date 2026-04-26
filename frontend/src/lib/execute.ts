import type { ExecutePayload } from "@/services/api";

type ExecuteValues = ExecutePayload["values"];

export function buildProcurementExecutePayload(
  functionName: string,
  values: ExecuteValues,
  projectId?: string | null,
  serviceId?: string | null,
): ExecutePayload {
  if (!projectId || !serviceId) {
    throw new Error("Missing projectId or serviceId");
  }

  return {
    functionName,
    values,
    projectId,
    serviceId,
  };
}
