import { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { toast } from "sonner";
import { addManualSupplier, deleteSupplier, selectSupplier, supplierSearchCancel, supplierSearchStart, supplierSearchStatus, } from "../services/api";
import { getProcurementErrorMessage } from "../lib/errors";
import { filterSuppliersByThreshold, getCoverageInfo, sortSuppliersByCoverage, } from "../lib/suppliers";
const parseSupplierSearchPayload = (value, depth = 0) => {
    if (value === null || value === undefined || depth >= 5) {
        return null;
    }
    if (typeof value === "string") {
        const normalized = value.trim();
        if (!normalized) {
            return null;
        }
        try {
            return parseSupplierSearchPayload(JSON.parse(normalized), depth + 1);
        }
        catch {
            return null;
        }
    }
    if (typeof value !== "object" || Array.isArray(value)) {
        return null;
    }
    const record = value;
    if (Array.isArray(record.suppliers)) {
        return record;
    }
    if ("output" in record) {
        return parseSupplierSearchPayload(record.output, depth + 1);
    }
    return record;
};
export function useProcurementSuppliers({ buildPayload, itemsCount, packageId, savedCoverageThreshold, setSuppliers, suppliers, t, }) {
    const searchPollingTimeoutRef = useRef(null);
    const activeSearchRunIdRef = useRef(null);
    const searchSessionRef = useRef(0);
    const [searchResult, setSearchResult] = useState(null);
    const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);
    const [isTransferringSuppliers, setIsTransferringSuppliers] = useState(false);
    const [supplierSearchError, setSupplierSearchError] = useState(null);
    const [selectedSearchSuppliers, setSelectedSearchSuppliers] = useState(new Set());
    const clearSearchPolling = useCallback(() => {
        if (searchPollingTimeoutRef.current !== null) {
            window.clearTimeout(searchPollingTimeoutRef.current);
            searchPollingTimeoutRef.current = null;
        }
    }, []);
    const resetSearchState = useCallback(() => {
        setIsSearchingSuppliers(false);
        setSearchResult(null);
        setSupplierSearchError(null);
        setSelectedSearchSuppliers(new Set());
    }, []);
    const applyCompletedSearchResult = useCallback((result) => {
        if (!result) {
            return;
        }
        const normalizedParsed = parseSupplierSearchPayload(result.parsed ?? result.raw ?? null);
        const hasResultPayload = (result.raw !== null &&
            result.raw !== undefined &&
            result.raw !== "") ||
            normalizedParsed !== null;
        setSearchResult(hasResultPayload
            ? {
                raw: result.raw ?? "",
                parsed: normalizedParsed,
            }
            : null);
    }, []);
    const cancelSearchRun = useCallback(async (searchRunId) => {
        try {
            await supplierSearchCancel(buildPayload("korus_ai_procurement__supplier_search_cancel", [
                searchRunId,
            ]));
        }
        catch (error) {
            console.warn("Failed to cancel supplier search run", error);
        }
    }, [buildPayload]);
    const pollSearchStatus = useCallback(async (searchRunId, sessionId) => {
        try {
            const result = await supplierSearchStatus(buildPayload("korus_ai_procurement__supplier_search_status", [
                searchRunId,
            ]));
            if (sessionId !== searchSessionRef.current) {
                return;
            }
            if (result.status === "running" ||
                result.status === "created" ||
                result.status === "cancel_requested") {
                searchPollingTimeoutRef.current = window.setTimeout(() => {
                    void pollSearchStatus(searchRunId, sessionId);
                }, 2000);
                return;
            }
            clearSearchPolling();
            activeSearchRunIdRef.current = null;
            setIsSearchingSuppliers(false);
            if (result.status === "completed") {
                applyCompletedSearchResult(result);
                return;
            }
            if (result.status === "cancelled") {
                resetSearchState();
                return;
            }
            setSearchResult(null);
            setSupplierSearchError(result.error || t("errors.searchFailedDescription"));
            toast.error(t("errors.searchFailedTitle"), {
                description: result.error || t("errors.searchFailedDescription"),
            });
        }
        catch (error) {
            if (sessionId !== searchSessionRef.current) {
                return;
            }
            clearSearchPolling();
            activeSearchRunIdRef.current = null;
            setIsSearchingSuppliers(false);
            setSearchResult(null);
            setSupplierSearchError(getProcurementErrorMessage(error, t("errors.searchFailed")));
            toast.error(t("errors.searchFailedTitle"), {
                description: getProcurementErrorMessage(error, t("errors.searchFailedDescription")),
            });
        }
    }, [
        applyCompletedSearchResult,
        buildPayload,
        clearSearchPolling,
        resetSearchState,
        t,
    ]);
    const handleSearchSuppliers = useCallback(async () => {
        if (!packageId || itemsCount === 0 || activeSearchRunIdRef.current) {
            return;
        }
        clearSearchPolling();
        searchSessionRef.current += 1;
        const currentSession = searchSessionRef.current;
        setIsSearchingSuppliers(true);
        setSearchResult(null);
        setSupplierSearchError(null);
        setSelectedSearchSuppliers(new Set());
        try {
            const result = await supplierSearchStart(buildPayload("korus_ai_procurement__supplier_search_start", [
                packageId,
            ]));
            if (currentSession !== searchSessionRef.current) {
                return;
            }
            activeSearchRunIdRef.current = result.searchRunId;
            if (result.status === "completed") {
                activeSearchRunIdRef.current = null;
                setIsSearchingSuppliers(false);
                applyCompletedSearchResult(result);
                return;
            }
            searchPollingTimeoutRef.current = window.setTimeout(() => {
                void pollSearchStatus(result.searchRunId, currentSession);
            }, 1200);
        }
        catch (error) {
            if (currentSession !== searchSessionRef.current) {
                return;
            }
            activeSearchRunIdRef.current = null;
            clearSearchPolling();
            setIsSearchingSuppliers(false);
            setSearchResult(null);
            setSupplierSearchError(getProcurementErrorMessage(error, t("errors.searchFailed")));
            toast.error(t("errors.searchFailedTitle"), {
                description: getProcurementErrorMessage(error, t("errors.searchFailedDescription")),
            });
        }
    }, [
        applyCompletedSearchResult,
        buildPayload,
        clearSearchPolling,
        itemsCount,
        packageId,
        pollSearchStatus,
        t,
    ]);
    const handleCancelSearchSuppliers = useCallback(() => {
        searchSessionRef.current += 1;
        clearSearchPolling();
        const activeSearchRunId = activeSearchRunIdRef.current;
        activeSearchRunIdRef.current = null;
        resetSearchState();
        if (activeSearchRunId) {
            void cancelSearchRun(activeSearchRunId);
        }
    }, [cancelSearchRun, clearSearchPolling, resetSearchState]);
    useEffect(() => {
        return () => {
            searchSessionRef.current += 1;
            clearSearchPolling();
            const activeSearchRunId = activeSearchRunIdRef.current;
            activeSearchRunIdRef.current = null;
            if (activeSearchRunId) {
                void cancelSearchRun(activeSearchRunId);
            }
        };
    }, [cancelSearchRun, clearSearchPolling]);
    useEffect(() => {
        setSelectedSearchSuppliers(new Set());
    }, [searchResult, savedCoverageThreshold]);
    const sortedSearchSuppliers = useMemo(() => sortSuppliersByCoverage(searchResult?.parsed?.suppliers ?? [], itemsCount), [searchResult, itemsCount]);
    const filteredSearchSuppliers = useMemo(() => filterSuppliersByThreshold(sortedSearchSuppliers, itemsCount, savedCoverageThreshold), [sortedSearchSuppliers, itemsCount, savedCoverageThreshold]);
    const handleAddSupplierFromSearch = useCallback(async (supplier) => {
        if (!packageId || !supplier.name) {
            return;
        }
        const coverage = getCoverageInfo(itemsCount, supplier.coverageCount ?? null, supplier.coverageRatio ?? null);
        const matchedItemsJson = supplier.matchedItems && supplier.matchedItems.length > 0
            ? JSON.stringify(supplier.matchedItems)
            : null;
        const created = await addManualSupplier(buildPayload("korus_ai_procurement__supplier_add_manual", [
            packageId,
            supplier.name,
            supplier.url || null,
            supplier.email || null,
            supplier.price || null,
            supplier.unit || null,
            supplier.note || null,
            true,
            coverage.count || null,
            coverage.ratio || null,
            matchedItemsJson,
            "search",
        ]));
        setSuppliers((previousSuppliers) => [...previousSuppliers, created]);
    }, [packageId, itemsCount, buildPayload, setSuppliers]);
    const handleToggleSupplier = useCallback(async (supplier) => {
        try {
            const updated = await selectSupplier(buildPayload("korus_ai_procurement__supplier_select", [
                supplier.id,
                !supplier.selected,
            ]));
            setSuppliers((previousSuppliers) => previousSuppliers.map((currentSupplier) => currentSupplier.id === updated.id ? updated : currentSupplier));
        }
        catch (error) {
            toast.error(t("errors.toggleSupplierFailedTitle"), {
                description: getProcurementErrorMessage(error, t("errors.toggleSupplierFailedDescription")),
            });
        }
    }, [buildPayload, setSuppliers, t]);
    const handleDeleteSupplier = useCallback(async (supplierId) => {
        try {
            await deleteSupplier(buildPayload("korus_ai_procurement__supplier_delete", [supplierId]));
            setSuppliers((previousSuppliers) => previousSuppliers.filter((supplier) => supplier.id !== supplierId));
        }
        catch (error) {
            toast.error(t("errors.deleteSupplierFailedTitle"), {
                description: getProcurementErrorMessage(error, t("errors.deleteSupplierFailedDescription")),
            });
        }
    }, [buildPayload, setSuppliers, t]);
    const handleToggleSearchSupplier = useCallback((index) => {
        setSelectedSearchSuppliers((currentSelection) => {
            const nextSelection = new Set(currentSelection);
            if (nextSelection.has(index)) {
                nextSelection.delete(index);
            }
            else {
                nextSelection.add(index);
            }
            return nextSelection;
        });
    }, []);
    const handleTransferSelectedSuppliers = useCallback(async () => {
        if (isTransferringSuppliers || selectedSearchSuppliers.size === 0) {
            return false;
        }
        setIsTransferringSuppliers(true);
        try {
            const existingNames = new Set(suppliers.map((supplier) => supplier.name.toLowerCase()));
            const selectedSuppliers = filteredSearchSuppliers.filter((_, index) => selectedSearchSuppliers.has(index));
            for (const supplier of selectedSuppliers) {
                if (!supplier.name) {
                    continue;
                }
                const nameKey = supplier.name.toLowerCase();
                if (existingNames.has(nameKey)) {
                    continue;
                }
                await handleAddSupplierFromSearch(supplier);
                existingNames.add(nameKey);
            }
            setSelectedSearchSuppliers(new Set());
            return true;
        }
        catch (error) {
            toast.error(t("errors.transferSuppliersFailedTitle"), {
                description: getProcurementErrorMessage(error, t("errors.transferSuppliersFailedDescription")),
            });
            return false;
        }
        finally {
            setIsTransferringSuppliers(false);
        }
    }, [
        filteredSearchSuppliers,
        handleAddSupplierFromSearch,
        isTransferringSuppliers,
        selectedSearchSuppliers,
        suppliers,
        t,
    ]);
    const hasSearchedSuppliers = Boolean(searchResult);
    const showSearchError = Boolean(supplierSearchError);
    const noSuppliersFound = !showSearchError &&
        hasSearchedSuppliers &&
        !isSearchingSuppliers &&
        (searchResult?.parsed?.suppliers?.length ?? 0) === 0;
    const noSuppliersMeetThreshold = !showSearchError &&
        hasSearchedSuppliers &&
        !isSearchingSuppliers &&
        (searchResult?.parsed?.suppliers?.length ?? 0) > 0 &&
        filteredSearchSuppliers.length === 0;
    return {
        filteredSearchSuppliers,
        handleCancelSearchSuppliers,
        handleDeleteSupplier,
        handleSearchSuppliers,
        handleToggleSearchSupplier,
        handleToggleSupplier,
        handleTransferSelectedSuppliers,
        hasSearchedSuppliers,
        isSearchingSuppliers,
        isTransferringSuppliers,
        noSuppliersFound,
        noSuppliersMeetThreshold,
        searchResult,
        selectedSearchSuppliers,
        showSearchError,
        supplierSearchError,
    };
}
//# sourceMappingURL=useProcurementSuppliers.js.map