import type { SupplierSearchResult } from "@/services/api";

export type SearchSupplier = NonNullable<
  NonNullable<SupplierSearchResult["parsed"]>["suppliers"]
>[number];

export type MatchedItemValue = { id?: string; name?: string } | string;

export function getCoverageInfo(
  totalItems: number,
  coverageCount?: number | null,
  coverageRatio?: number | null,
) {
  const count = coverageCount ?? 0;
  let ratio = coverageRatio ?? null;

  if (ratio === null && totalItems > 0 && count > 0) {
    ratio = count / totalItems;
  }

  const percent =
    ratio !== null ? Math.round(Math.min(Math.max(ratio, 0), 1) * 100) : null;

  return {
    total: totalItems,
    count,
    ratio,
    percent,
  };
}

export function formatCoverageLabel(
  totalItems: number,
  coverageCount?: number | null,
  coverageRatio?: number | null,
) {
  const coverage = getCoverageInfo(totalItems, coverageCount, coverageRatio);
  return coverage.total > 0
    ? `${coverage.count}/${coverage.total} (${coverage.percent ?? 0}%)`
    : "-";
}

export function formatMatchedItems(
  itemsList?: MatchedItemValue[],
  jsonFallback?: string | null,
) {
  let itemsToRender: MatchedItemValue[] = itemsList ?? [];

  if (!itemsToRender.length && jsonFallback) {
    try {
      const parsed = JSON.parse(jsonFallback);
      if (Array.isArray(parsed)) {
        itemsToRender = parsed;
      }
    } catch {
      return null;
    }
  }

  const names = itemsToRender
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter((name): name is string => Boolean(name));

  return names.length ? names.join(", ") : null;
}

export function sortSuppliersByCoverage<T extends SearchSupplier>(
  suppliers: T[],
  totalItems: number,
) {
  return [...suppliers].sort((left, right) => {
    const leftCoverage = getCoverageInfo(
      totalItems,
      left.coverageCount ?? null,
      left.coverageRatio ?? null,
    );
    const rightCoverage = getCoverageInfo(
      totalItems,
      right.coverageCount ?? null,
      right.coverageRatio ?? null,
    );

    const ratioDiff = (rightCoverage.ratio ?? 0) - (leftCoverage.ratio ?? 0);
    if (ratioDiff !== 0) {
      return ratioDiff;
    }

    return (rightCoverage.count ?? 0) - (leftCoverage.count ?? 0);
  });
}

export function filterSuppliersByThreshold<T extends SearchSupplier>(
  suppliers: T[],
  totalItems: number,
  threshold: number,
) {
  return suppliers.filter((supplier) => {
    const coverage = getCoverageInfo(
      totalItems,
      supplier.coverageCount ?? null,
      supplier.coverageRatio ?? null,
    );

    return (coverage.ratio ?? 0) >= threshold;
  });
}
