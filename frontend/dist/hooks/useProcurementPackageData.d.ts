import { type ExecutePayload, type ProcurementItem, type ProcurementKpAnalysis, type ProcurementKpDocument, type ProcurementLetter, type ProcurementNmcResult, type ProcurementPackage, type ProcurementSupplier } from "../services/api";
type BuildPayload = (functionName: string, values: ExecutePayload["values"]) => ExecutePayload;
interface UseProcurementPackageDataParams {
    buildPayload: BuildPayload;
    isCreateMode: boolean;
    packageId?: string;
}
export declare function useProcurementPackageData({ buildPayload, isCreateMode, packageId, }: UseProcurementPackageDataParams): {
    items: ProcurementItem[];
    kpAnalysis: ProcurementKpAnalysis | null;
    kpDocuments: ProcurementKpDocument[];
    letters: ProcurementLetter[];
    loadPackage: () => Promise<void>;
    nmcResult: ProcurementNmcResult | null;
    packageData: ProcurementPackage | null;
    packageDataError: string | null;
    refreshPackageData: (currentPackageId: string) => Promise<void>;
    setItems: import("react").Dispatch<import("react").SetStateAction<ProcurementItem[]>>;
    setKpAnalysis: import("react").Dispatch<import("react").SetStateAction<ProcurementKpAnalysis | null>>;
    setKpDocuments: import("react").Dispatch<import("react").SetStateAction<ProcurementKpDocument[]>>;
    setLetters: import("react").Dispatch<import("react").SetStateAction<ProcurementLetter[]>>;
    setNmcResult: import("react").Dispatch<import("react").SetStateAction<ProcurementNmcResult | null>>;
    setPackageData: import("react").Dispatch<import("react").SetStateAction<ProcurementPackage | null>>;
    setSuppliers: import("react").Dispatch<import("react").SetStateAction<ProcurementSupplier[]>>;
    suppliers: ProcurementSupplier[];
};
export {};
//# sourceMappingURL=useProcurementPackageData.d.ts.map