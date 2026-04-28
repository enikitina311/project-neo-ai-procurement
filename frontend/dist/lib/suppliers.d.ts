import type { SupplierSearchResult } from "../services/api";
export type SearchSupplier = NonNullable<NonNullable<SupplierSearchResult["parsed"]>["suppliers"]>[number];
export type MatchedItemValue = {
    id?: string;
    name?: string;
} | string;
export declare function getCoverageInfo(totalItems: number, coverageCount?: number | null, coverageRatio?: number | null): {
    total: number;
    count: number;
    ratio: number | null;
    percent: number | null;
};
export declare function formatCoverageLabel(totalItems: number, coverageCount?: number | null, coverageRatio?: number | null): string;
export declare function formatMatchedItems(itemsList?: MatchedItemValue[], jsonFallback?: string | null): string | null;
export declare function sortSuppliersByCoverage<T extends SearchSupplier>(suppliers: T[], totalItems: number): T[];
export declare function filterSuppliersByThreshold<T extends SearchSupplier>(suppliers: T[], totalItems: number, threshold: number): T[];
//# sourceMappingURL=suppliers.d.ts.map