import { type Dispatch, type SetStateAction } from "react";
import { type ExecutePayload, type ProcurementSupplier, type SupplierSearchResult } from "../services/api";
type BuildPayload = (functionName: string, values: ExecutePayload["values"]) => ExecutePayload;
interface UseProcurementSuppliersParams {
    buildPayload: BuildPayload;
    itemsCount: number;
    packageId?: string;
    savedCoverageThreshold: number;
    setSuppliers: Dispatch<SetStateAction<ProcurementSupplier[]>>;
    suppliers: ProcurementSupplier[];
    t: (key: string) => string;
}
export declare function useProcurementSuppliers({ buildPayload, itemsCount, packageId, savedCoverageThreshold, setSuppliers, suppliers, t, }: UseProcurementSuppliersParams): {
    filteredSearchSuppliers: {
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
    }[];
    handleCancelSearchSuppliers: () => void;
    handleDeleteSupplier: (supplierId: string) => Promise<void>;
    handleSearchSuppliers: () => Promise<void>;
    handleToggleSearchSupplier: (index: number) => void;
    handleToggleSupplier: (supplier: ProcurementSupplier) => Promise<void>;
    handleTransferSelectedSuppliers: () => Promise<boolean>;
    hasSearchedSuppliers: boolean;
    isSearchingSuppliers: boolean;
    isTransferringSuppliers: boolean;
    noSuppliersFound: boolean;
    noSuppliersMeetThreshold: boolean;
    searchResult: SupplierSearchResult | null;
    selectedSearchSuppliers: Set<number>;
    showSearchError: boolean;
    supplierSearchError: string | null;
};
export {};
//# sourceMappingURL=useProcurementSuppliers.d.ts.map