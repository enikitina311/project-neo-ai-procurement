import type { ProcurementSupplier } from "../../services/api";
import { type SearchSupplier } from "../../lib/suppliers";
interface ProcurementSuppliersTabProps {
    filteredSearchSuppliers: SearchSupplier[];
    handleCancelSearchSuppliers: () => void;
    handleDeleteSupplier: (supplierId: string) => void | Promise<void>;
    handleSearchSuppliers: () => void | Promise<void>;
    handleToggleSearchSupplier: (index: number) => void;
    handleTransferSelectedSuppliers: () => boolean | Promise<boolean>;
    isCreateMode: boolean;
    isSearchingSuppliers: boolean;
    isTransferringSuppliers: boolean;
    itemsCount: number;
    noSuppliersFound: boolean;
    noSuppliersMeetThreshold: boolean;
    savedCoverageThreshold: number;
    savedCoverageThresholdPercent: number;
    savedSuppliersLimit: number;
    searchResultRaw?: string;
    selectedSearchSuppliers: Set<number>;
    showSearchError: boolean;
    suppliers: ProcurementSupplier[];
}
export declare function ProcurementSuppliersTab({ filteredSearchSuppliers, handleCancelSearchSuppliers, handleDeleteSupplier, handleSearchSuppliers, handleToggleSearchSupplier, handleTransferSelectedSuppliers, isCreateMode, isSearchingSuppliers, isTransferringSuppliers, itemsCount, noSuppliersFound, noSuppliersMeetThreshold, savedCoverageThreshold, savedCoverageThresholdPercent, savedSuppliersLimit, searchResultRaw, selectedSearchSuppliers, showSearchError, suppliers, }: ProcurementSuppliersTabProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProcurementSuppliersTab.d.ts.map