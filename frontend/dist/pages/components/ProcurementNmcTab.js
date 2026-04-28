import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Loader, } from "@enikitina311/ui";
import { parseProcurementNmcTableJson, } from "../../services/api";
const numberFormatter = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const formatNumber = (value) => {
    if (value === null || value === undefined) {
        return "";
    }
    return numberFormatter.format(value);
};
export function ProcurementNmcTab({ handleGenerateNmc, isGeneratingNmc, nmcResult, }) {
    const { t } = useTranslation("procurement");
    const parsedNmcTable = useMemo(() => parseProcurementNmcTableJson(nmcResult?.nmcTableJson), [nmcResult?.nmcTableJson]);
    const hasStructuredTable = !!parsedNmcTable &&
        parsedNmcTable.suppliers.length > 0 &&
        parsedNmcTable.rows.length > 0;
    return (_jsxs("div", { className: "procurement-section", children: [_jsx(Button, { onClick: handleGenerateNmc, disabled: isGeneratingNmc, children: isGeneratingNmc
                    ? t("actions.generatingNmc")
                    : t("actions.generateNmc") }), isGeneratingNmc && (_jsx(Loader, { size: "default", caption: t("actions.generatingNmc") })), hasStructuredTable ? (_jsxs(Card, { className: "procurement-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t("tabs.nmc") }) }), _jsx(CardContent, { children: _jsx("div", { className: "procurement-nmc-scroll", children: _jsxs("table", { className: "procurement-nmc-table", children: [_jsxs("colgroup", { children: [_jsx("col", { className: "procurement-nmc-col procurement-nmc-col--no" }), _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--name" }), _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--specs" }), _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--qty" }), _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--unit" }), parsedNmcTable.suppliers.flatMap((supplier) => [
                                                _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--offer-qty" }, `${supplier.supplierName}-qty-col`),
                                                _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--offer-price" }, `${supplier.supplierName}-price-col`),
                                                _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--offer-vat" }, `${supplier.supplierName}-vat-col`),
                                                _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--offer-total" }, `${supplier.supplierName}-total-col`),
                                            ]), _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--summary" }), _jsx("col", { className: "procurement-nmc-col procurement-nmc-col--summary" })] }), _jsxs("thead", { children: [_jsxs("tr", { children: [_jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-sticky-col procurement-nmc-sticky-col-1", rowSpan: 2, children: t("table.positionNo") }), _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header", rowSpan: 2, children: t("fields.itemName") }), _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header", rowSpan: 2, children: t("table.specs") }), _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header", rowSpan: 2, children: t("table.qty") }), _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header", rowSpan: 2, children: t("table.unit") }), parsedNmcTable.suppliers.map((supplier) => (_jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--supplier-group", colSpan: 4, children: supplier.supplierName }, supplier.supplierName))), _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header", rowSpan: 2, children: t("labels.averageUnitPriceWithVat") }), _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header", rowSpan: 2, children: t("labels.nmcTotalWithVat") })] }), _jsx("tr", { children: parsedNmcTable.suppliers.flatMap((supplier) => [
                                                    _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--subheader", children: t("table.qty") }, `${supplier.supplierName}-qty`),
                                                    _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--subheader", children: t("labels.priceWithVat") }, `${supplier.supplierName}-price`),
                                                    _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--subheader", children: t("labels.vatPercent") }, `${supplier.supplierName}-vat`),
                                                    _jsx("th", { className: "procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--subheader", children: t("labels.totalWithVat") }, `${supplier.supplierName}-total`),
                                                ]) })] }), _jsx("tbody", { children: parsedNmcTable.rows.map((row) => {
                                            const offersBySupplier = new Map(row.offers.map((offer) => [offer.supplierName, offer]));
                                            return (_jsxs("tr", { children: [_jsx("td", { className: "procurement-nmc-cell procurement-nmc-sticky-col procurement-nmc-sticky-col-1 procurement-nmc-cell--center", children: row.positionNo }), _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--item-name", children: row.itemName }), _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--specs", children: row.specs || "" }), _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--center", children: row.requestedQty ?? "" }), _jsx("td", { className: "procurement-nmc-cell", children: row.requestedUnit || "" }), parsedNmcTable.suppliers.flatMap((supplier) => {
                                                        const offer = offersBySupplier.get(supplier.supplierName);
                                                        return [
                                                            _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--center", children: offer?.qty ?? "" }, `${row.positionNo}-${supplier.supplierName}-qty`),
                                                            _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--numeric", children: formatNumber(offer?.priceWithVat) }, `${row.positionNo}-${supplier.supplierName}-price`),
                                                            _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--center", children: formatNumber(offer?.vatPercent) }, `${row.positionNo}-${supplier.supplierName}-vat`),
                                                            _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--numeric", children: formatNumber(offer?.totalWithVat) }, `${row.positionNo}-${supplier.supplierName}-total`),
                                                        ];
                                                    }), _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--numeric procurement-nmc-cell--summary", children: formatNumber(row.averageUnitPriceWithVat) }), _jsx("td", { className: "procurement-nmc-cell procurement-nmc-cell--numeric procurement-nmc-cell--summary", children: formatNumber(row.nmcTotalWithVat) })] }, `${row.positionNo}-${row.itemName}`));
                                        }) })] }) }) })] })) : nmcResult?.nmcTableText ? (_jsxs(Card, { className: "procurement-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t("labels.nmcDebugTitle") }) }), _jsx(CardContent, { children: _jsx("pre", { className: "procurement-pre", children: nmcResult.nmcTableText }) })] })) : (!isGeneratingNmc && (_jsx(EmptyState, { title: t("empty.noNmcTitle"), description: t("empty.noNmcDescription") })))] }));
}
//# sourceMappingURL=ProcurementNmcTab.js.map