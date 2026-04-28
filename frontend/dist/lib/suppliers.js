export function getCoverageInfo(totalItems, coverageCount, coverageRatio) {
    const count = coverageCount ?? 0;
    let ratio = coverageRatio ?? null;
    if (ratio === null && totalItems > 0 && count > 0) {
        ratio = count / totalItems;
    }
    const percent = ratio !== null ? Math.round(Math.min(Math.max(ratio, 0), 1) * 100) : null;
    return {
        total: totalItems,
        count,
        ratio,
        percent,
    };
}
export function formatCoverageLabel(totalItems, coverageCount, coverageRatio) {
    const coverage = getCoverageInfo(totalItems, coverageCount, coverageRatio);
    return coverage.total > 0
        ? `${coverage.count}/${coverage.total} (${coverage.percent ?? 0}%)`
        : "-";
}
export function formatMatchedItems(itemsList, jsonFallback) {
    let itemsToRender = itemsList ?? [];
    if (!itemsToRender.length && jsonFallback) {
        try {
            const parsed = JSON.parse(jsonFallback);
            if (Array.isArray(parsed)) {
                itemsToRender = parsed;
            }
        }
        catch {
            return null;
        }
    }
    const names = itemsToRender
        .map((item) => (typeof item === "string" ? item : item?.name))
        .filter((name) => Boolean(name));
    return names.length ? names.join(", ") : null;
}
export function sortSuppliersByCoverage(suppliers, totalItems) {
    return [...suppliers].sort((left, right) => {
        const leftCoverage = getCoverageInfo(totalItems, left.coverageCount ?? null, left.coverageRatio ?? null);
        const rightCoverage = getCoverageInfo(totalItems, right.coverageCount ?? null, right.coverageRatio ?? null);
        const ratioDiff = (rightCoverage.ratio ?? 0) - (leftCoverage.ratio ?? 0);
        if (ratioDiff !== 0) {
            return ratioDiff;
        }
        return (rightCoverage.count ?? 0) - (leftCoverage.count ?? 0);
    });
}
export function filterSuppliersByThreshold(suppliers, totalItems, threshold) {
    return suppliers.filter((supplier) => {
        const coverage = getCoverageInfo(totalItems, supplier.coverageCount ?? null, supplier.coverageRatio ?? null);
        return (coverage.ratio ?? 0) >= threshold;
    });
}
//# sourceMappingURL=suppliers.js.map