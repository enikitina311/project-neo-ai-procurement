import type { PluginApiClient } from "@enikitina311/plugin-sdk-fe";
export declare function setApiClient(api: PluginApiClient): void;
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
export type SupplierSearchRunStatus = "created" | "running" | "completed" | "failed" | "cancel_requested" | "cancelled";
export type SupplierSearchRunResult = {
    searchRunId: string;
    status: SupplierSearchRunStatus;
    raw?: string | null;
    parsed?: SupplierSearchResult["parsed"];
    error?: string | null;
};
export declare const parseProcurementNmcTableJson: (raw?: string | null) => ProcurementNmcTableJson | null;
export declare const listPackages: (payload: ExecutePayload) => Promise<ProcurementPackage[]>;
export declare const createPackage: (payload: ExecutePayload) => Promise<ProcurementPackage>;
export declare const updatePackage: (payload: ExecutePayload) => Promise<ProcurementPackage>;
export declare const getPackage: (payload: ExecutePayload) => Promise<ProcurementPackage>;
export declare const listItems: (payload: ExecutePayload) => Promise<ProcurementItem[]>;
export declare const createItem: (payload: ExecutePayload) => Promise<ProcurementItem>;
export declare const updateItem: (payload: ExecutePayload) => Promise<ProcurementItem>;
export declare const deleteItem: (payload: ExecutePayload) => Promise<boolean>;
export declare const listSuppliers: (payload: ExecutePayload) => Promise<ProcurementSupplier[]>;
export declare const supplierSearch: (payload: ExecutePayload, signal?: AbortSignal) => Promise<SupplierSearchResult>;
export declare const supplierSearchStart: (payload: ExecutePayload) => Promise<SupplierSearchRunResult>;
export declare const supplierSearchStatus: (payload: ExecutePayload) => Promise<SupplierSearchRunResult>;
export declare const supplierSearchCancel: (payload: ExecutePayload) => Promise<SupplierSearchRunResult>;
export declare const addManualSupplier: (payload: ExecutePayload) => Promise<ProcurementSupplier>;
export declare const selectSupplier: (payload: ExecutePayload) => Promise<ProcurementSupplier>;
export declare const deleteSupplier: (payload: ExecutePayload) => Promise<boolean>;
export declare const generateLetters: (payload: ExecutePayload) => Promise<ProcurementLetter[]>;
export declare const listLetters: (payload: ExecutePayload) => Promise<ProcurementLetter[]>;
export declare const uploadKpDocument: (payload: ExecutePayload) => Promise<ProcurementKpDocument>;
export declare const listKpDocuments: (payload: ExecutePayload) => Promise<ProcurementKpDocument[]>;
export declare const deleteKpDocument: (payload: ExecutePayload) => Promise<boolean>;
export declare const extractKpDocument: (payload: ExecutePayload) => Promise<ProcurementKpAnalysis>;
export declare const analyzeKpDocument: (payload: ExecutePayload) => Promise<ProcurementKpAnalysis>;
export declare const getKpAnalysis: (payload: ExecutePayload) => Promise<ProcurementKpAnalysis | null>;
export declare const generateNmc: (payload: ExecutePayload) => Promise<ProcurementNmcResult>;
export declare const getNmcResult: (payload: ExecutePayload) => Promise<ProcurementNmcResult | null>;
export declare const uploadProcurementFile: (file: File, projectId: string, subPathIds: string[]) => Promise<{
    id: string;
}>;
export declare const openProcurementFile: (fileId: string, fileName?: string | null) => Promise<void>;
//# sourceMappingURL=api.d.ts.map