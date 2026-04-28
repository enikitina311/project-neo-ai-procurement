import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ConfirmationDialog, EmptyState, Input, Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, TextArea, } from "@enikitina311/ui";
import { Pencil, Plus, Trash2 } from "lucide-react";
function getRequirementsPreview(value) {
    if (!value)
        return "";
    return value.replace(/\s+/g, " ").trim();
}
function shouldShowRequirementsExpand(value) {
    const preview = getRequirementsPreview(value);
    if (!preview)
        return false;
    return preview.length > 120 || (value?.includes("\n") ?? false);
}
export function ProcurementItemsTab({ handleAddItemIfReady, handleDeleteItem, handleUpdateItem, isCreateMode, itemAddVersion, items, newItemName, newItemQty, newItemSpecs, newItemUnit, onNewItemNameChange, onNewItemQtyChange, onNewItemSpecsChange, onNewItemUnitChange, }) {
    const { t } = useTranslation("procurement");
    const { t: tCommon } = useTranslation("common");
    const addNameInputRef = useRef(null);
    const editNameInputRef = useRef(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editItemName, setEditItemName] = useState("");
    const [editItemSpecs, setEditItemSpecs] = useState("");
    const [editItemQty, setEditItemQty] = useState("");
    const [editItemUnit, setEditItemUnit] = useState("");
    const [expandedItemIds, setExpandedItemIds] = useState([]);
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    useEffect(() => {
        if (itemAddVersion > 0 && !isCreateMode) {
            setIsAddModalOpen(false);
        }
    }, [isCreateMode, itemAddVersion]);
    useEffect(() => {
        if (isAddModalOpen) {
            addNameInputRef.current?.focus();
        }
    }, [isAddModalOpen]);
    useEffect(() => {
        if (editingItemId) {
            editNameInputRef.current?.focus();
        }
    }, [editingItemId]);
    useEffect(() => {
        const currentItemIds = new Set(items.map((item) => item.id));
        setExpandedItemIds((previous) => previous.filter((itemId) => currentItemIds.has(itemId)));
        if (editingItemId && !currentItemIds.has(editingItemId)) {
            setEditingItemId(null);
            setEditItemName("");
            setEditItemSpecs("");
            setEditItemQty("");
            setEditItemUnit("");
        }
    }, [editingItemId, items]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        await handleAddItemIfReady();
    };
    const handleEditSubmit = async (event) => {
        event.preventDefault();
        if (!editingItemId || !editItemName.trim())
            return;
        await handleUpdateItem(editingItemId, {
            name: editItemName,
            qty: editItemQty,
            specs: editItemSpecs,
            unit: editItemUnit,
        });
        setEditingItemId(null);
    };
    const toggleExpanded = (itemId) => {
        setExpandedItemIds((previous) => {
            const isExpanded = previous.includes(itemId);
            return isExpanded
                ? previous.filter((currentId) => currentId !== itemId)
                : [...previous, itemId];
        });
    };
    const openEditModal = (item) => {
        setEditingItemId(item.id);
        setEditItemName(item.name || "");
        setEditItemSpecs(item.specs || "");
        setEditItemQty(item.qty !== null && item.qty !== undefined ? String(item.qty) : "");
        setEditItemUnit(item.unit || "");
    };
    return (_jsxs("div", { className: "procurement-section procurement-items-tab", children: [_jsx("div", { className: "procurement-items-toolbar", children: _jsx(Button, { type: "button", startIcon: _jsx(Plus, {}), onClick: () => setIsAddModalOpen(true), disabled: isCreateMode, children: t("sections.addItem") }) }), _jsx(Modal, { open: isAddModalOpen, onOpenChange: (o) => !o && setIsAddModalOpen(false), children: _jsxs(ModalContent, { size: "default", children: [_jsx(ModalHeader, { children: _jsx(ModalTitle, { children: t("sections.addItem") }) }), _jsxs("form", { id: "procurement-add-item-form", className: "procurement-items-modal-form", onSubmit: handleSubmit, children: [_jsxs("div", { className: "procurement-items-create-field procurement-items-create-field--name", children: [_jsx("div", { className: "procurement-items-create-label", children: t("fields.itemName") }), _jsx(Input, { ref: addNameInputRef, placeholder: t("fields.itemName"), value: newItemName, onChange: (event) => onNewItemNameChange(event.target.value), disabled: isCreateMode })] }), _jsxs("div", { className: "procurement-items-create-field procurement-items-create-field--specs", children: [_jsx("div", { className: "procurement-items-create-label", children: t("fields.itemSpecs") }), _jsx(TextArea, { placeholder: t("fields.itemSpecs"), value: newItemSpecs, onChange: (event) => onNewItemSpecsChange(event.target.value), disabled: isCreateMode, autoResize: true, rows: 1, minHeight: 44, maxHeight: 220 }), _jsx("div", { className: "procurement-items-create-helper", children: t("labels.requirementsHelper") })] }), _jsxs("div", { className: "procurement-items-modal-meta", children: [_jsxs("div", { className: "procurement-items-create-field procurement-items-create-field--qty", children: [_jsx("div", { className: "procurement-items-create-label", children: t("fields.itemQty") }), _jsx(Input, { placeholder: t("fields.itemQty"), type: "number", value: newItemQty, onChange: (event) => onNewItemQtyChange(event.target.value), disabled: isCreateMode })] }), _jsxs("div", { className: "procurement-items-create-field procurement-items-create-field--unit", children: [_jsx("div", { className: "procurement-items-create-label", children: t("fields.itemUnit") }), _jsx(Input, { placeholder: t("fields.itemUnit"), value: newItemUnit, onChange: (event) => onNewItemUnitChange(event.target.value), disabled: isCreateMode })] })] })] }), _jsxs(ModalFooter, { children: [_jsx(Button, { variant: "outline", type: "button", onClick: () => setIsAddModalOpen(false), children: tCommon("actions.cancel") }), _jsx(Button, { type: "submit", form: "procurement-add-item-form", startIcon: _jsx(Plus, {}), disabled: isCreateMode || !newItemName.trim(), children: tCommon("actions.add") })] })] }) }), _jsx(Modal, { open: editingItemId !== null, onOpenChange: (o) => !o && setEditingItemId(null), children: _jsxs(ModalContent, { size: "default", children: [_jsx(ModalHeader, { children: _jsx(ModalTitle, { children: tCommon("actions.edit") }) }), _jsxs("form", { id: "procurement-edit-item-form", className: "procurement-items-modal-form", onSubmit: handleEditSubmit, children: [_jsxs("div", { className: "procurement-items-create-field procurement-items-create-field--name", children: [_jsx("div", { className: "procurement-items-create-label", children: t("fields.itemName") }), _jsx(Input, { ref: editNameInputRef, placeholder: t("fields.itemName"), value: editItemName, onChange: (event) => setEditItemName(event.target.value) })] }), _jsxs("div", { className: "procurement-items-create-field procurement-items-create-field--specs", children: [_jsx("div", { className: "procurement-items-create-label", children: t("fields.itemSpecs") }), _jsx(TextArea, { placeholder: t("fields.itemSpecs"), value: editItemSpecs, onChange: (event) => setEditItemSpecs(event.target.value), autoResize: true, rows: 1, minHeight: 44, maxHeight: 220 }), _jsx("div", { className: "procurement-items-create-helper", children: t("labels.requirementsHelper") })] }), _jsxs("div", { className: "procurement-items-modal-meta", children: [_jsxs("div", { className: "procurement-items-create-field procurement-items-create-field--qty", children: [_jsx("div", { className: "procurement-items-create-label", children: t("fields.itemQty") }), _jsx(Input, { placeholder: t("fields.itemQty"), type: "number", value: editItemQty, onChange: (event) => setEditItemQty(event.target.value) })] }), _jsxs("div", { className: "procurement-items-create-field procurement-items-create-field--unit", children: [_jsx("div", { className: "procurement-items-create-label", children: t("fields.itemUnit") }), _jsx(Input, { placeholder: t("fields.itemUnit"), value: editItemUnit, onChange: (event) => setEditItemUnit(event.target.value) })] })] })] }), _jsxs(ModalFooter, { children: [_jsx(Button, { variant: "outline", type: "button", onClick: () => setEditingItemId(null), children: tCommon("actions.cancel") }), _jsx(Button, { type: "submit", form: "procurement-edit-item-form", disabled: !editItemName.trim(), children: tCommon("actions.save") })] })] }) }), items.length === 0 ? (_jsx(EmptyState, { title: t("empty.noItemsTitle"), description: t("empty.noItemsDescription") })) : (_jsx("div", { className: "procurement-table-wrapper procurement-items-table-wrapper", children: _jsxs(Table, { className: "procurement-items-table", children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHeaderCell, { width: "64px", children: "#" }), _jsx(TableHeaderCell, { width: "22%", children: t("table.name") }), _jsx(TableHeaderCell, { children: t("table.specs") }), _jsx(TableHeaderCell, { width: "120px", children: t("table.qty") }), _jsx(TableHeaderCell, { width: "140px", children: t("table.unit") }), _jsx(TableHeaderCell, { width: "132px", align: "right", children: t("table.actions") })] }) }), _jsx(TableBody, { children: items.map((item, index) => {
                                const isExpanded = expandedItemIds.includes(item.id);
                                const requirementsPreview = getRequirementsPreview(item.specs);
                                const showExpandRequirements = shouldShowRequirementsExpand(item.specs);
                                return (_jsxs(Fragment, { children: [_jsxs(TableRow, { className: "procurement-item-row", children: [_jsx(TableCell, { className: "procurement-item-index", width: "64px", children: index + 1 }), _jsx(TableCell, { className: "procurement-item-name-cell", width: "22%", children: item.name || "-" }), _jsxs(TableCell, { className: "procurement-item-specs-cell", children: [_jsx("div", { className: "procurement-item-specs-preview", children: requirementsPreview || (_jsx("span", { className: "procurement-item-specs-empty", children: t("labels.requirementsEmpty") })) }), !isExpanded && showExpandRequirements && (_jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => toggleExpanded(item.id), children: ["... ", t("actions.expandRequirements")] }))] }), _jsx(TableCell, { className: "procurement-item-qty-cell", width: "120px", children: item.qty !== null && item.qty !== undefined
                                                        ? String(item.qty)
                                                        : "-" }), _jsx(TableCell, { className: "procurement-item-unit-cell", width: "140px", children: item.unit || "-" }), _jsx(TableCell, { className: "procurement-item-actions-cell", width: "132px", align: "right", children: _jsxs("div", { className: "procurement-item-actions-group", children: [_jsx(Button, { variant: "outline", iconOnly: true, type: "button", onClick: () => openEditModal(item), title: tCommon("actions.edit"), children: _jsx(Pencil, { className: "icon-sm" }) }), _jsx(Button, { variant: "outline", iconOnly: true, type: "button", onClick: () => setDeleteConfirmItem(item), title: t("actions.delete"), children: _jsx(Trash2, { className: "icon-sm" }) })] }) })] }), isExpanded && (_jsx(TableRow, { className: "procurement-item-details-row", children: _jsx(TableCell, { colSpan: 6, className: "procurement-item-details-cell", children: _jsxs("div", { className: "procurement-item-details", children: [_jsxs("div", { className: "procurement-item-details-header", children: [_jsxs("div", { children: [_jsx("div", { className: "procurement-item-details-title", children: t("table.specs") }), _jsx("div", { className: "procurement-item-details-description", children: t("labels.requirementsHelper") })] }), _jsx("div", { className: "procurement-item-details-actions", children: _jsx(Button, { variant: "ghost", size: "sm", type: "button", onClick: () => toggleExpanded(item.id), children: t("actions.collapseRequirements") }) })] }), _jsx("div", { className: "procurement-item-details-text", children: item.specs?.trim() ||
                                                                t("labels.requirementsEmpty") })] }) }) }))] }, item.id));
                            }) })] }) })), _jsx(ConfirmationDialog, { open: deleteConfirmItem !== null, onOpenChange: (open) => {
                    if (!open) {
                        setDeleteConfirmItem(null);
                    }
                }, onConfirm: async () => {
                    if (deleteConfirmItem) {
                        await handleDeleteItem(deleteConfirmItem.id);
                    }
                    setDeleteConfirmItem(null);
                }, title: t("dialogs.deleteItemTitle"), description: t("dialogs.deleteItemDescription", {
                    name: deleteConfirmItem?.name ?? "",
                }), variant: "danger", confirmText: tCommon("delete") })] }));
}
//# sourceMappingURL=ProcurementItemsTab.js.map