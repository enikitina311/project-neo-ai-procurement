// Phase 14 Group H: apiClient now ships from plugin-sdk-fe and is wired
// through <PluginHostProvider> at the host's plugin route boundary.
import { apiClient } from "@enikitina311/plugin-sdk-fe";
export { apiClient };
const parseNullableNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string") {
        const normalized = value
            .trim()
            .replace(/\s+/g, "")
            .replace(",", ".")
            .replace(/[^0-9.-]/g, "");
        if (!normalized)
            return null;
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
export const parseProcurementNmcTableJson = (raw) => {
    if (!raw) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.suppliers) || !Array.isArray(parsed.rows)) {
            return null;
        }
        return {
            suppliers: parsed.suppliers.map((supplier) => ({
                supplierName: String(supplier?.supplierName ?? "").trim(),
            })),
            rows: parsed.rows.map((row, index) => ({
                positionNo: parseNullableNumber(row?.positionNo) ?? index + 1,
                itemName: String(row?.itemName ?? "").trim(),
                specs: row?.specs === null || row?.specs === undefined
                    ? null
                    : String(row.specs).trim(),
                requestedQty: parseNullableNumber(row?.requestedQty),
                requestedUnit: row?.requestedUnit === null || row?.requestedUnit === undefined
                    ? null
                    : String(row.requestedUnit).trim(),
                offers: Array.isArray(row?.offers)
                    ? row.offers.map((offer) => ({
                        supplierName: String(offer?.supplierName ?? "").trim(),
                        qty: parseNullableNumber(offer?.qty),
                        priceWithVat: parseNullableNumber(offer?.priceWithVat),
                        vatPercent: parseNullableNumber(offer?.vatPercent),
                        totalWithVat: parseNullableNumber(offer?.totalWithVat),
                    }))
                    : [],
                averageUnitPriceWithVat: parseNullableNumber(row?.averageUnitPriceWithVat),
                nmcTotalWithVat: parseNullableNumber(row?.nmcTotalWithVat),
            })),
            table: parsed.table === null || parsed.table === undefined
                ? null
                : String(parsed.table),
        };
    }
    catch {
        return null;
    }
};
const execute = async (payload) => {
    const { data } = await apiClient.post("/workspaces/actions/execute", payload);
    return data.result;
};
export const listPackages = (payload) => execute(payload);
export const createPackage = (payload) => execute(payload);
export const updatePackage = (payload) => execute(payload);
export const getPackage = (payload) => execute(payload);
export const listItems = (payload) => execute(payload);
export const createItem = (payload) => execute(payload);
export const updateItem = (payload) => execute(payload);
export const deleteItem = (payload) => execute(payload);
export const listSuppliers = (payload) => execute(payload);
export const supplierSearch = async (payload, signal) => {
    const { data } = await apiClient.post("/workspaces/actions/execute", payload, { timeout: 180000, signal });
    return data.result;
};
export const supplierSearchStart = (payload) => execute(payload);
export const supplierSearchStatus = (payload) => execute(payload);
export const supplierSearchCancel = (payload) => execute(payload);
export const addManualSupplier = (payload) => execute(payload);
export const selectSupplier = (payload) => execute(payload);
export const deleteSupplier = (payload) => execute(payload);
export const generateLetters = (payload) => execute(payload);
export const listLetters = (payload) => execute(payload);
export const uploadKpDocument = (payload) => execute(payload);
export const listKpDocuments = (payload) => execute(payload);
export const deleteKpDocument = (payload) => execute(payload);
export const extractKpDocument = (payload) => execute(payload);
export const analyzeKpDocument = (payload) => execute(payload);
export const getKpAnalysis = (payload) => execute(payload);
export const generateNmc = (payload) => execute(payload);
export const getNmcResult = (payload) => execute(payload);
export const uploadProcurementFile = async (file, projectId, subPathIds) => {
    const formData = new FormData();
    formData.append("file", file);
    const searchParams = new URLSearchParams();
    searchParams.append("projectId", projectId);
    subPathIds.forEach((id) => searchParams.append("subPathIds", id));
    const url = `/workspaces/files/upload?${searchParams.toString()}`;
    const { data } = await apiClient.post(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};
export const openProcurementFile = async (fileId, fileName) => {
    const url = `/workspaces/files/${fileId}/download`;
    const response = await apiClient.get(url, {
        responseType: "blob",
    });
    const blobUrl = window.URL.createObjectURL(response.data);
    const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");
    if (!newWindow) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName || "document";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
    }, 1000);
};
//# sourceMappingURL=api.js.map