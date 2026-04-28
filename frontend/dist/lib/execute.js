export function buildProcurementExecutePayload(functionName, values, projectId, serviceId) {
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
//# sourceMappingURL=execute.js.map