import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button, EmptyState, PageHeader, SectionHeader, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, Tabs, TabsList, TabsTrigger, } from "@enikitina311/ui";
import { Pencil, Package, Plus, RefreshCw } from "lucide-react";
import { listItems, listPackages, listSuppliers, } from "../services/api";
import { getProcurementErrorMessage } from "../lib/errors";
import { buildProcurementExecutePayload } from "../lib/execute";
import { formatCoverageLabel } from "../lib/suppliers";
// Legacy CSS removed (Phase 2.7 cleanup track).
function getSupplierUrlLabel(url) {
    try {
        const { hostname } = new URL(url);
        return hostname.replace(/^www\./, "");
    }
    catch {
        return url.replace(/^https?:\/\//, "");
    }
}
export default function ProcurementPage() {
    const { t } = useTranslation("procurement");
    const { t: tCommon } = useTranslation("common");
    const navigate = useNavigate();
    const { projectId, serviceId } = useParams();
    const [packages, setPackages] = useState([]);
    const [activePackageId, setActivePackageId] = useState("");
    const [activeTab, setActiveTab] = useState("items");
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [packagesLoadError, setPackagesLoadError] = useState(null);
    // Host's currentPage state derived from URL — plugin не диспатчит.
    const buildPayload = useCallback((functionName, values) => buildProcurementExecutePayload(functionName, values, projectId, serviceId), [projectId, serviceId]);
    const activePackage = useMemo(() => packages.find((pkg) => pkg.id === activePackageId) || null, [packages, activePackageId]);
    const refreshPackages = useCallback(async () => {
        if (!projectId || !serviceId)
            return;
        setPackagesLoadError(null);
        try {
            const result = await listPackages(buildPayload("korus_ai_procurement__package_list", [projectId]));
            setPackages(result);
            if (result.length > 0 && !activePackageId) {
                setActivePackageId(result[0].id);
            }
            if (result.length === 0) {
                setActivePackageId("");
            }
        }
        catch (error) {
            const message = getProcurementErrorMessage(error, t("errors.loadPackagesFailedDescription"));
            setPackagesLoadError(message);
            toast.error(t("errors.loadPackagesFailedTitle"), {
                description: message,
            });
        }
    }, [projectId, serviceId, buildPayload, activePackageId, t]);
    const refreshPackageData = useCallback(async (packageId) => {
        if (!packageId)
            return;
        try {
            const [itemsResult, suppliersResult] = await Promise.all([
                listItems(buildPayload("korus_ai_procurement__items_list", [packageId])),
                listSuppliers(buildPayload("korus_ai_procurement__supplier_list", [packageId])),
            ]);
            setItems(itemsResult);
            setSuppliers(suppliersResult);
        }
        catch (error) {
            toast.error(t("errors.loadPackageDataFailedTitle"), {
                description: getProcurementErrorMessage(error, t("errors.loadPackageDataFailedDescription")),
            });
        }
    }, [buildPayload, t]);
    useEffect(() => {
        refreshPackages();
    }, [refreshPackages]);
    useEffect(() => {
        if (activePackageId) {
            refreshPackageData(activePackageId);
            setActiveTab("items");
        }
    }, [activePackageId, refreshPackageData]);
    const handleAddPackage = useCallback(() => {
        if (!projectId || !serviceId)
            return;
        navigate(`/${projectId}/procurement/${serviceId}/create`);
    }, [navigate, projectId, serviceId]);
    const handleEditPackage = useCallback(() => {
        if (!projectId || !serviceId || !activePackageId)
            return;
        navigate(`/${projectId}/procurement/${serviceId}/${activePackageId}`);
    }, [navigate, projectId, serviceId, activePackageId]);
    const tabs = [
        {
            id: "items",
            label: t("tabs.items"),
            count: items.length,
            content: (_jsx("div", { className: "procurement-tab-content", children: items.length === 0 ? (_jsx(EmptyState, { title: t("empty.noItemsTitle"), description: t("empty.noItemsDescription") })) : (_jsx("div", { className: "procurement-table-wrapper", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHeaderCell, { children: t("table.name") }), _jsx(TableHeaderCell, { children: t("table.specs") }), _jsx(TableHeaderCell, { children: t("table.qty") }), _jsx(TableHeaderCell, { children: t("table.unit") })] }) }), _jsx(TableBody, { children: items.map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: item.name }), _jsx(TableCell, { children: item.specs }), _jsx(TableCell, { children: item.qty }), _jsx(TableCell, { children: item.unit })] }, item.id))) })] }) })) })),
        },
        {
            id: "suppliers",
            label: t("tabs.suppliers"),
            count: suppliers.length,
            content: (_jsx("div", { className: "procurement-tab-content", children: suppliers.length === 0 ? (_jsx(EmptyState, { title: t("empty.noSuppliersTitle"), description: t("empty.noSuppliersDescription") })) : (_jsx("div", { className: "procurement-table-wrapper", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHeaderCell, { children: t("table.name") }), _jsx(TableHeaderCell, { children: t("table.url") }), _jsx(TableHeaderCell, { children: t("table.email") }), _jsx(TableHeaderCell, { children: t("table.price") }), _jsx(TableHeaderCell, { children: t("table.unit") }), _jsx(TableHeaderCell, { children: t("table.coverage") }), _jsx(TableHeaderCell, { children: t("table.selected") })] }) }), _jsx(TableBody, { children: suppliers.map((supplier) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: supplier.name }), _jsx(TableCell, { children: supplier.url ? (_jsx("a", { className: "procurement-supplier-link", href: supplier.url, target: "_blank", rel: "noreferrer", title: supplier.url, children: _jsx("span", { className: "procurement-supplier-link-text", children: getSupplierUrlLabel(supplier.url) }) })) : ("-") }), _jsx(TableCell, { children: supplier.email || "-" }), _jsx(TableCell, { children: supplier.price }), _jsx(TableCell, { children: supplier.unit }), _jsx(TableCell, { children: formatCoverageLabel(items.length, supplier.coverageCount ?? null, supplier.coverageRatio ?? null) }), _jsx(TableCell, { children: supplier.selected ? t("labels.yes") : t("labels.no") })] }, supplier.id))) })] }) })) })),
        },
    ];
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsx(PageHeader, { title: t("pageTitle"), breadcrumbs: [
                    { label: tCommon("home"), onClick: () => navigate("/home") },
                    { label: t("pageTitle") },
                ] }), _jsxs("div", { className: "flex flex-1 overflow-auto p-4 sm:p-6 flex-col gap-4", children: [_jsx(SectionHeader, { icon: _jsx(Package, {}), title: t("sections.packages"), actions: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", onClick: refreshPackages, startIcon: _jsx(RefreshCw, {}), children: t("actions.refresh") }), _jsx(Button, { variant: "secondary", onClick: handleEditPackage, startIcon: _jsx(Pencil, {}), disabled: !activePackage, children: t("actions.editPackage") }), _jsx(Button, { variant: "secondary", onClick: handleAddPackage, startIcon: _jsx(Plus, {}), children: t("actions.addPackage") })] }) }), !activePackage && (_jsx(EmptyState, { title: packagesLoadError
                            ? t("errors.loadPackagesFailedTitle")
                            : t("empty.noPackagesTitle"), description: packagesLoadError || t("empty.noPackagesDescription") })), activePackage && (_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsx(TabsList, { children: tabs.map((tab) => (_jsx(TabsTrigger, { value: tab.id, children: tab.label }, tab.id))) }), tabs.find((t) => t.id === activeTab)?.content] }))] })] }));
}
//# sourceMappingURL=ProcurementPage.js.map