import type { PluginApiClient } from "@enikitina311/plugin-sdk-fe";

/**
 * Module-level apiClient singleton, инициализируется host'ом при boot
 * через `setApiClient(hostApiClient)` ПЕРЕД монтированием routes плагина.
 */
let _api: PluginApiClient | null = null;

export function setApiClient(api: PluginApiClient): void {
  _api = api;
}

function getApi(): PluginApiClient {
  if (!_api) {
    throw new Error(
      "Procurement frontend module: apiClient не инициализирован. " +
        "Host должен вызвать setApiClient(apiClient) перед mount'ом routes.",
    );
  }
  return _api;
}

export type ExecutePayload = {
  functionName: string;
  values: (string | number | boolean | null)[] | object[];
  projectId: string;
  serviceId: string;
};

export type ProcurementPackage = {
  id: string;
  projectId: string;
  name: string;
  criteriaText?: string | null;
  coverageThreshold?: number | null;
  suppliersLimit?: number | null;
};

export type ProcurementItem = {
  id: string;
  packageId: string;
  name: string;
  specs?: string | null;
  qty?: number | null;
  unit?: string | null;
};

export type ProcurementSupplier = {
  id: string;
  packageId: string;
  name: string;
  url?: string | null;
  email?: string | null;
  price?: number | null;
  unit?: string | null;
  note?: string | null;
  origin?: string | null;
  selected?: boolean | null;
  coverageCount?: number | null;
  coverageRatio?: number | null;
  matchedItemsJson?: string | null;
};

export type ProcurementLetter = {
  id: string;
  packageId: string;
  supplierId: string;
  subject?: string | null;
  body?: string | null;
  status?: string | null;
};

export type ProcurementKpDocument = {
  id: string;
  packageId: string;
  fileId: string;
  fileName?: string | null;
  supplierName?: string | null;
  uploadedAt?: string | null;
};

export type ProcurementKpAnalysis = {
  id: string;
  kpDocumentId: string;
  sourceText?: string | null;
  summary?: string | null;
  criteriaEvaluationJson?: string | null;
  standardChecksJson?: string | null;
  supplierName?: string | null;
  isComplete?: boolean | null;
  missingFields?: string | null;
  extractedItemsJson?: string | null;
  extractedFactsJson?: string | null;
  extractionStatus?: string | null;
  analysisStatus?: string | null;
  extractedAt?: string | null;
  analyzedAt?: string | null;
  totalWithoutVat?: string | null;
  totalWithVat?: string | null;
  notes?: string | null;
};

export type ProcurementNmcResult = {
  id: string;
  packageId: string;
  nmcTableJson?: string | null;
  nmcTableText?: string | null;
};

export type ProcurementNmcTableSupplier = {
  supplierName: string;
};

export type ProcurementNmcTableOffer = {
  supplierName: string;
  qty?: number | null;
  priceWithVat?: number | null;
  vatPercent?: number | null;
  totalWithVat?: number | null;
};

export type ProcurementNmcTableRow = {
  positionNo: number;
  itemName: string;
  specs?: string | null;
  requestedQty?: number | null;
  requestedUnit?: string | null;
  offers: ProcurementNmcTableOffer[];
  averageUnitPriceWithVat?: number | null;
  nmcTotalWithVat?: number | null;
};

export type ProcurementNmcTableJson = {
  suppliers: ProcurementNmcTableSupplier[];
  rows: ProcurementNmcTableRow[];
  table?: string | null;
};

export type SupplierSearchResult = {
  raw: string;
  parsed?: {
    suppliers?: Array<{
      name?: string;
      url?: string;
      email?: string;
      price?: string;
      unit?: string;
      note?: string;
      coverageCount?: number;
      coverageRatio?: number;
      matchedItems?: Array<{
        id?: string;
        name?: string;
      }>;
    }>;
    table?: string;
    [key: string]: unknown;
  } | null;
};

export type SupplierSearchRunStatus =
  | "created"
  | "running"
  | "completed"
  | "failed"
  | "cancel_requested"
  | "cancelled";

export type SupplierSearchRunResult = {
  searchRunId: string;
  status: SupplierSearchRunStatus;
  raw?: string | null;
  parsed?: SupplierSearchResult["parsed"];
  error?: string | null;
};

const parseNullableNumber = (value: unknown): number | null => {
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
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const parseProcurementNmcTableJson = (
  raw?: string | null,
): ProcurementNmcTableJson | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      suppliers?: Array<{ supplierName?: unknown }>;
      rows?: Array<{
        positionNo?: unknown;
        itemName?: unknown;
        specs?: unknown;
        requestedQty?: unknown;
        requestedUnit?: unknown;
        offers?: Array<{
          supplierName?: unknown;
          qty?: unknown;
          priceWithVat?: unknown;
          vatPercent?: unknown;
          totalWithVat?: unknown;
        }>;
        averageUnitPriceWithVat?: unknown;
        nmcTotalWithVat?: unknown;
      }>;
      table?: unknown;
    };

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
        specs:
          row?.specs === null || row?.specs === undefined
            ? null
            : String(row.specs).trim(),
        requestedQty: parseNullableNumber(row?.requestedQty),
        requestedUnit:
          row?.requestedUnit === null || row?.requestedUnit === undefined
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
        averageUnitPriceWithVat: parseNullableNumber(
          row?.averageUnitPriceWithVat,
        ),
        nmcTotalWithVat: parseNullableNumber(row?.nmcTotalWithVat),
      })),
      table:
        parsed.table === null || parsed.table === undefined
          ? null
          : String(parsed.table),
    };
  } catch {
    return null;
  }
};

const execute = async <T>(payload: ExecutePayload): Promise<T> => {
  const { data } = await getApi().post<{ result: T }>(
    "/workspaces/execute",
    payload,
  );
  return data.result;
};

export const listPackages = (payload: ExecutePayload) =>
  execute<ProcurementPackage[]>(payload);

export const createPackage = (payload: ExecutePayload) =>
  execute<ProcurementPackage>(payload);

export const updatePackage = (payload: ExecutePayload) =>
  execute<ProcurementPackage>(payload);

export const getPackage = (payload: ExecutePayload) =>
  execute<ProcurementPackage>(payload);

export const listItems = (payload: ExecutePayload) =>
  execute<ProcurementItem[]>(payload);

export const createItem = (payload: ExecutePayload) =>
  execute<ProcurementItem>(payload);

export const updateItem = (payload: ExecutePayload) =>
  execute<ProcurementItem>(payload);

export const deleteItem = (payload: ExecutePayload) =>
  execute<boolean>(payload);

export const listSuppliers = (payload: ExecutePayload) =>
  execute<ProcurementSupplier[]>(payload);

export const supplierSearch = async (
  payload: ExecutePayload,
  signal?: AbortSignal,
) => {
  const { data } = await getApi().post<{ result: SupplierSearchResult }>(
    "/workspaces/execute",
    payload,
    { timeout: 180000, signal },
  );
  return data.result;
};

export const supplierSearchStart = (payload: ExecutePayload) =>
  execute<SupplierSearchRunResult>(payload);

export const supplierSearchStatus = (payload: ExecutePayload) =>
  execute<SupplierSearchRunResult>(payload);

export const supplierSearchCancel = (payload: ExecutePayload) =>
  execute<SupplierSearchRunResult>(payload);

export const addManualSupplier = (payload: ExecutePayload) =>
  execute<ProcurementSupplier>(payload);

export const selectSupplier = (payload: ExecutePayload) =>
  execute<ProcurementSupplier>(payload);

export const deleteSupplier = (payload: ExecutePayload) =>
  execute<boolean>(payload);

export const generateLetters = (payload: ExecutePayload) =>
  execute<ProcurementLetter[]>(payload);

export const listLetters = (payload: ExecutePayload) =>
  execute<ProcurementLetter[]>(payload);

export const uploadKpDocument = (payload: ExecutePayload) =>
  execute<ProcurementKpDocument>(payload);

export const listKpDocuments = (payload: ExecutePayload) =>
  execute<ProcurementKpDocument[]>(payload);

export const deleteKpDocument = (payload: ExecutePayload) =>
  execute<boolean>(payload);

export const extractKpDocument = (payload: ExecutePayload) =>
  execute<ProcurementKpAnalysis>(payload);

export const analyzeKpDocument = (payload: ExecutePayload) =>
  execute<ProcurementKpAnalysis>(payload);

export const getKpAnalysis = (payload: ExecutePayload) =>
  execute<ProcurementKpAnalysis | null>(payload);

export const generateNmc = (payload: ExecutePayload) =>
  execute<ProcurementNmcResult>(payload);

export const getNmcResult = (payload: ExecutePayload) =>
  execute<ProcurementNmcResult | null>(payload);

export const uploadProcurementFile = async (
  file: File,
  projectId: string,
  subPathIds: string[],
) => {
  const formData = new FormData();
  formData.append("file", file);

  const searchParams = new URLSearchParams();
  searchParams.append("projectId", projectId);
  subPathIds.forEach((id) => searchParams.append("subPathIds", id));

  const url = `/workspaces/files/upload?${searchParams.toString()}`;

  const { data } = await getApi().post<{ id: string }>(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const openProcurementFile = async (
  fileId: string,
  fileName?: string | null,
) => {
  const url = `/workspaces/files/${fileId}/download`;
  const response = await getApi().get<Blob>(url, {
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
