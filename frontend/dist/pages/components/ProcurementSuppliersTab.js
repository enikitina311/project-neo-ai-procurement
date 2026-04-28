import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, ConfirmationDialog, EmptyState, Loader, Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, Tag, } from "@enikitina311/ui";
import { Trash2 } from "lucide-react";
import { formatCoverageLabel, formatMatchedItems, getCoverageInfo, } from "../../lib/suppliers";
function renderCoverageTag(totalItems, coverageCount, coverageRatio, threshold) {
    const coverage = getCoverageInfo(totalItems, coverageCount, coverageRatio);
    const variant = coverage.ratio !== null && coverage.ratio >= threshold
        ? "success"
        : "secondary";
    return (_jsx(Tag, { variant: variant, size: "sm", children: formatCoverageLabel(totalItems, coverageCount, coverageRatio) }));
}
function getSupplierUrlLabel(url) {
    try {
        const { hostname } = new URL(url);
        return hostname.replace(/^www\./, "");
    }
    catch {
        return url.replace(/^https?:\/\//, "");
    }
}
export function ProcurementSuppliersTab({ filteredSearchSuppliers, handleCancelSearchSuppliers, handleDeleteSupplier, handleSearchSuppliers, handleToggleSearchSupplier, handleTransferSelectedSuppliers, isCreateMode, isSearchingSuppliers, isTransferringSuppliers, itemsCount, noSuppliersFound, noSuppliersMeetThreshold, savedCoverageThreshold, savedCoverageThresholdPercent, savedSuppliersLimit, searchResultRaw, selectedSearchSuppliers, showSearchError, suppliers, }) {
    const { t } = useTranslation("procurement");
    const { t: tCommon } = useTranslation("common");
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [deleteConfirmSupplier, setDeleteConfirmSupplier] = useState(null);
    const existingSupplierNames = useMemo(() => new Set(suppliers.map((supplier) => supplier.name.toLowerCase())), [suppliers]);
    const handleCloseSearchModal = () => {
        handleCancelSearchSuppliers();
        setIsSearchModalOpen(false);
    };
    useEffect(() => {
        if (!isSearchModalOpen || isCreateMode || itemsCount === 0) {
            return;
        }
        void handleSearchSuppliers();
    }, [handleSearchSuppliers, isCreateMode, isSearchModalOpen, itemsCount]);
    const handleTransferFromModal = async () => {
        const transferred = await handleTransferSelectedSuppliers();
        if (transferred) {
            setIsSearchModalOpen(false);
        }
    };
    return (_jsxs("div", { className: "procurement-section procurement-suppliers-tab", children: [_jsxs("div", { className: "procurement-suppliers-toolbar", children: [_jsxs("div", { className: "procurement-suppliers-meta", children: [_jsx("span", { children: t("labels.coverageThreshold", {
                                    value: savedCoverageThresholdPercent,
                                }) }), _jsx("span", { className: "procurement-threshold-separator", children: "\u2022" }), _jsx("span", { children: t("labels.suppliersLimit", { value: savedSuppliersLimit }) })] }), _jsx(Button, { onClick: () => setIsSearchModalOpen(true), disabled: isCreateMode || itemsCount === 0, children: t("actions.findSuppliers") })] }), _jsx(Modal, { open: isSearchModalOpen, onOpenChange: (o) => !o && handleCloseSearchModal(), children: _jsxs(ModalContent, { size: "lg", children: [_jsx(ModalHeader, { children: _jsx(ModalTitle, { children: t("actions.findSuppliers") }) }), _jsxs("div", { className: "flex flex-col gap-3 px-6", children: [_jsxs("div", { className: "procurement-suppliers-meta procurement-suppliers-meta--modal", children: [_jsx("span", { children: t("labels.coverageThreshold", {
                                                value: savedCoverageThresholdPercent,
                                            }) }), _jsx("span", { className: "procurement-threshold-separator", children: "\u2022" }), _jsx("span", { children: t("labels.suppliersLimit", { value: savedSuppliersLimit }) })] }), isSearchingSuppliers && (_jsx(Loader, { size: "default", caption: t("actions.searchingSuppliers") })), showSearchError && (_jsx(EmptyState, { title: t("errors.searchFailedTitle"), description: t("errors.searchFailedDescription") })), noSuppliersFound && (_jsx(EmptyState, { title: t("empty.suppliersNotFoundTitle"), description: t("empty.suppliersNotFoundDescription") })), noSuppliersMeetThreshold && (_jsx(EmptyState, { title: t("empty.suppliersBelowThresholdTitle"), description: t("empty.suppliersBelowThresholdDescription") })), filteredSearchSuppliers.length > 0 && (_jsx("div", { className: "procurement-table-wrapper procurement-suppliers-table-wrapper", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHeaderCell, { width: "48px", children: "" }), _jsx(TableHeaderCell, { width: "36%", children: t("table.name") }), _jsx(TableHeaderCell, { width: "26%", children: t("table.url") }), _jsx(TableHeaderCell, { width: "16%", children: t("table.email") }), _jsx(TableHeaderCell, { width: "18%", children: t("table.coverage") })] }) }), _jsx(TableBody, { children: filteredSearchSuppliers.map((supplier, index) => {
                                                    const normalizedName = supplier.name?.toLowerCase() || "";
                                                    const isAlreadyAdded = normalizedName !== "" &&
                                                        existingSupplierNames.has(normalizedName);
                                                    const matched = formatMatchedItems(supplier.matchedItems);
                                                    return (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(Checkbox, { checked: !isAlreadyAdded &&
                                                                        selectedSearchSuppliers.has(index), onChange: () => handleToggleSearchSupplier(index), disabled: isAlreadyAdded ||
                                                                        isSearchingSuppliers ||
                                                                        isTransferringSuppliers }) }), _jsxs(TableCell, { children: [_jsxs("div", { className: "procurement-supplier-row-head", children: [_jsx("div", { className: "procurement-supplier-name", children: supplier.name }), isAlreadyAdded && (_jsx(Tag, { variant: "secondary", size: "sm", className: "procurement-supplier-status-tag", children: t("labels.alreadyAdded") }))] }), matched ? (_jsx("div", { className: "procurement-supplier-items procurement-supplier-items--clamped", children: matched })) : null] }), _jsx(TableCell, { children: supplier.url ? (_jsx("a", { className: "procurement-supplier-link", href: supplier.url, target: "_blank", rel: "noreferrer", title: supplier.url, children: _jsx("span", { className: "procurement-supplier-link-text", children: getSupplierUrlLabel(supplier.url) }) })) : ("-") }), _jsx(TableCell, { children: supplier.email || "-" }), _jsx(TableCell, { children: renderCoverageTag(itemsCount, supplier.coverageCount ?? null, supplier.coverageRatio ?? null, savedCoverageThreshold) })] }, `${supplier.name}-${index}`));
                                                }) })] }) })), searchResultRaw && (_jsx("pre", { className: "procurement-pre", children: searchResultRaw }))] }), _jsxs(ModalFooter, { children: [_jsx(Button, { variant: "outline", type: "button", onClick: handleCloseSearchModal, children: tCommon("actions.cancel") }), _jsx(Button, { type: "button", onClick: handleTransferFromModal, disabled: isSearchingSuppliers ||
                                        isTransferringSuppliers ||
                                        selectedSearchSuppliers.size === 0, children: isTransferringSuppliers
                                        ? t("actions.transferringSuppliers")
                                        : t("actions.transferSelectedSuppliers") })] })] }) }), suppliers.length === 0 ? (_jsx(EmptyState, { title: t("empty.noSuppliersTitle"), description: t("empty.noSuppliersDescription") })) : (_jsx("div", { className: "procurement-table-wrapper procurement-suppliers-table-wrapper", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHeaderCell, { width: "38%", children: t("table.name") }), _jsx(TableHeaderCell, { width: "24%", children: t("table.url") }), _jsx(TableHeaderCell, { width: "14%", children: t("table.email") }), _jsx(TableHeaderCell, { width: "14%", children: t("table.coverage") }), _jsx(TableHeaderCell, { width: "10%", align: "right", children: t("table.actions") })] }) }), _jsx(TableBody, { children: suppliers.map((supplier) => {
                                const matched = formatMatchedItems(undefined, supplier.matchedItemsJson ?? null);
                                return (_jsxs(TableRow, { children: [_jsxs(TableCell, { children: [_jsx("div", { className: "procurement-supplier-name", children: supplier.name }), matched ? (_jsx("div", { className: "procurement-supplier-items procurement-supplier-items--clamped", children: matched })) : null] }), _jsx(TableCell, { children: supplier.url ? (_jsx("a", { className: "procurement-supplier-link", href: supplier.url, target: "_blank", rel: "noreferrer", title: supplier.url, children: _jsx("span", { className: "procurement-supplier-link-text", children: getSupplierUrlLabel(supplier.url) }) })) : ("-") }), _jsx(TableCell, { children: supplier.email || "-" }), _jsx(TableCell, { children: renderCoverageTag(itemsCount, supplier.coverageCount ?? null, supplier.coverageRatio ?? null, savedCoverageThreshold) }), _jsx(TableCell, { className: "procurement-item-actions-cell", align: "right", children: _jsx("div", { className: "procurement-item-actions-group", children: _jsx(Button, { variant: "outline", iconOnly: true, type: "button", onClick: () => setDeleteConfirmSupplier(supplier), title: t("actions.delete"), disabled: isCreateMode, children: _jsx(Trash2, { className: "icon-sm" }) }) }) })] }, supplier.id));
                            }) })] }) })), _jsx(ConfirmationDialog, { open: deleteConfirmSupplier !== null, onOpenChange: (open) => {
                    if (!open) {
                        setDeleteConfirmSupplier(null);
                    }
                }, onConfirm: async () => {
                    if (deleteConfirmSupplier) {
                        await handleDeleteSupplier(deleteConfirmSupplier.id);
                    }
                    setDeleteConfirmSupplier(null);
                }, title: t("dialogs.deleteSupplierTitle"), description: t("dialogs.deleteSupplierDescription", {
                    name: deleteConfirmSupplier?.name ?? "",
                }), variant: "danger", confirmText: tCommon("delete") })] }));
}
//# sourceMappingURL=ProcurementSuppliersTab.js.map