import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, CardHeader, CardTitle, ConfirmationDialog, EmptyState, FileUpload, Loader, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, Tag, } from "@enikitina311/ui";
import { ChevronDown, Trash2 } from "lucide-react";
function parseJsonArray(value) {
    if (!value) {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function getStatusVariant(status) {
    switch (status) {
        case "completed":
            return "success";
        case "failed":
            return "destructive";
        case "running":
            return "secondary";
        default:
            return "secondary";
    }
}
function formatValue(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    return value;
}
export function ProcurementKpTab({ handleAnalyzeKp, handleExtractKp, handleDeleteKp, handleOpenKp, handleSelectKpDocument, handleUploadKp, isAnalyzingKp, isDeletingKp, isExtractingKp, isUploadingKp, kpAnalysis, kpDocuments, selectedKpDocumentId, }) {
    const { t } = useTranslation("procurement");
    const { t: tCommon } = useTranslation("common");
    const [deleteConfirmDocument, setDeleteConfirmDocument] = useState(null);
    const [isExtractionCollapsed, setIsExtractionCollapsed] = useState(false);
    const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false);
    const selectedFiles = [];
    const handleFilesChange = useCallback((files) => {
        void handleUploadKp(files[0]?.file ?? null);
    }, [handleUploadKp]);
    useEffect(() => {
        if (!selectedKpDocumentId && kpDocuments[0]) {
            void handleSelectKpDocument(kpDocuments[0].id);
        }
    }, [handleSelectKpDocument, kpDocuments, selectedKpDocumentId]);
    const selectedDocument = useMemo(() => {
        if (kpDocuments.length === 0) {
            return null;
        }
        if (!selectedKpDocumentId) {
            return kpDocuments[0] || null;
        }
        return (kpDocuments.find((document) => document.id === selectedKpDocumentId) ||
            kpDocuments[0] ||
            null);
    }, [kpDocuments, selectedKpDocumentId]);
    const selectedDocumentAnalysis = kpAnalysis?.kpDocumentId === selectedDocument?.id ? kpAnalysis : null;
    const extractedItems = useMemo(() => parseJsonArray(selectedDocumentAnalysis?.extractedItemsJson), [selectedDocumentAnalysis?.extractedItemsJson]);
    const standardChecks = useMemo(() => parseJsonArray(selectedDocumentAnalysis?.standardChecksJson), [selectedDocumentAnalysis?.standardChecksJson]);
    const criteriaEvaluation = useMemo(() => parseJsonArray(selectedDocumentAnalysis?.criteriaEvaluationJson), [selectedDocumentAnalysis?.criteriaEvaluationJson]);
    const extractionStatus = selectedDocumentAnalysis?.extractionStatus;
    const analysisStatus = selectedDocumentAnalysis?.analysisStatus;
    const canAnalyze = extractionStatus === "completed" && !isExtractingKp;
    const selectedDocumentName = selectedDocument?.fileName || selectedDocument?.id;
    const selectedDocumentUploadedAt = selectedDocument?.uploadedAt
        ? new Date(selectedDocument.uploadedAt).toLocaleString()
        : "—";
    const extractionToggleLabel = isExtractionCollapsed
        ? t("actions.expandSection")
        : t("actions.collapseSection");
    const analysisToggleLabel = isAnalysisCollapsed
        ? t("actions.expandSection")
        : t("actions.collapseSection");
    return (_jsxs("div", { className: "procurement-section", children: [_jsx(FileUpload, { files: selectedFiles, onFilesChange: handleFilesChange, accept: ".pdf,.png,.jpg,.jpeg", multiple: false, variant: "compact", helper: t("labels.kpUploadHelper"), disabled: isUploadingKp }), isUploadingKp && _jsx(Loader, { size: "default", caption: t("actions.uploadingKp") }), _jsxs("div", { className: "procurement-subsection", children: [_jsx("div", { className: "procurement-subtitle", children: t("sections.kpDocuments") }), kpDocuments.length === 0 ? (_jsx(EmptyState, { title: t("empty.noKpDocumentsTitle"), description: t("empty.noKpDocumentsDescription") })) : (_jsxs("div", { className: "procurement-kp-layout", children: [_jsxs(Card, { className: "procurement-card procurement-kp-list-panel", children: [_jsx(CardHeader, { className: "procurement-kp-list-header", children: _jsxs(CardTitle, { children: [t("sections.kpDocuments"), " (", kpDocuments.length, ")"] }) }), _jsx(CardContent, { className: "procurement-kp-list", children: kpDocuments.map((document) => {
                                            const isActive = document.id === selectedDocument?.id;
                                            return (_jsxs("div", { className: `procurement-kp-list-item${isActive ? " procurement-kp-list-item--active" : ""}`, children: [_jsxs("button", { type: "button", className: "procurement-kp-list-item-main", onClick: () => void handleSelectKpDocument(document.id), children: [_jsx("div", { className: "procurement-kp-list-item-heading", children: document.fileName || document.id }), _jsx("div", { className: "procurement-kp-list-item-supplier", children: document.supplierName ||
                                                                    t("labels.kpSupplierDetectedPending") }), _jsx("div", { className: "procurement-kp-list-item-date", children: document.uploadedAt
                                                                    ? new Date(document.uploadedAt).toLocaleString()
                                                                    : "—" }), _jsx("div", { className: "procurement-kp-file-meta", children: document.id })] }), _jsxs("div", { className: "procurement-kp-list-item-actions", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: (event) => {
                                                                    event.stopPropagation();
                                                                    void handleOpenKp(document.fileId, document.fileName);
                                                                }, children: t("actions.openKp") }), _jsx(Button, { variant: "outline", size: "sm", iconOnly: true, type: "button", onClick: (event) => {
                                                                    event.stopPropagation();
                                                                    setDeleteConfirmDocument(document);
                                                                }, title: t("actions.delete"), disabled: isDeletingKp || isExtractingKp || isAnalyzingKp, children: _jsx(Trash2, { className: "icon-sm" }) })] })] }, document.id));
                                        }) })] }), _jsx("div", { className: "procurement-kp-detail", children: !selectedDocument ? (_jsx(EmptyState, { title: t("empty.selectKpDocumentTitle"), description: t("empty.selectKpDocumentDescription") })) : (_jsxs(_Fragment, { children: [_jsx(Card, { className: "procurement-card procurement-kp-detail-card", children: _jsxs(CardContent, { className: "procurement-kp-detail-header", children: [_jsxs("div", { className: "procurement-kp-detail-heading", children: [_jsx("div", { className: "procurement-kp-detail-title", children: selectedDocumentName }), _jsx("div", { className: "procurement-kp-detail-subtitle", children: selectedDocument.supplierName ||
                                                                    t("labels.kpSupplierDetectedPending") })] }), _jsxs("div", { className: "procurement-kp-detail-meta", children: [_jsxs("div", { className: "procurement-kp-detail-meta-item", children: [_jsx("span", { className: "procurement-kp-fact-label", children: t("table.uploadedAt") }), _jsx("span", { className: "procurement-kp-fact-value", children: selectedDocumentUploadedAt })] }), _jsx("div", { className: "procurement-kp-detail-actions", children: _jsx(Button, { variant: "outline", onClick: () => void handleOpenKp(selectedDocument.fileId, selectedDocument.fileName), children: t("actions.openKp") }) })] })] }) }), _jsx("div", { className: "procurement-subtitle", children: t("sections.kpAnalysis") }), _jsxs("div", { className: "procurement-kp-workspace", children: [_jsxs(Card, { className: "procurement-card procurement-kp-workspace-panel", children: [_jsxs(CardHeader, { className: "procurement-kp-section-header", children: [_jsxs("div", { className: "procurement-kp-section-heading", children: [_jsx(CardTitle, { children: t("sections.kpExtraction") }), _jsx("div", { className: "procurement-kp-panel-status", children: _jsx(Tag, { variant: getStatusVariant(extractionStatus), children: t(`labels.kpStatus.${extractionStatus || "not_started"}`) }) })] }), _jsxs("div", { className: "procurement-kp-section-actions", children: [_jsx(Button, { onClick: () => void handleExtractKp(selectedDocument.id), disabled: isExtractingKp || isDeletingKp || isAnalyzingKp, children: isExtractingKp
                                                                                ? t("actions.extractingData")
                                                                                : t("actions.extractData") }), _jsx(Button, { variant: "ghost", size: "sm", className: "procurement-kp-section-toggle", onClick: () => setIsExtractionCollapsed((value) => !value), endIcon: _jsx(ChevronDown, { className: `procurement-kp-toggle-icon${isExtractionCollapsed ? " procurement-kp-toggle-icon--collapsed" : ""}` }), children: extractionToggleLabel })] })] }), !isExtractionCollapsed && (_jsx(CardContent, { children: extractionStatus === "completed" &&
                                                                selectedDocumentAnalysis ? (_jsxs("div", { className: "procurement-kp-report", children: [_jsxs("div", { className: "procurement-kp-facts-grid", children: [_jsxs("div", { className: "procurement-kp-fact-card", children: [_jsx("div", { className: "procurement-kp-fact-label", children: t("labels.detectedSupplier") }), _jsx("div", { className: "procurement-kp-fact-value", children: formatValue(selectedDocumentAnalysis.supplierName) })] }), _jsxs("div", { className: "procurement-kp-fact-card", children: [_jsx("div", { className: "procurement-kp-fact-label", children: t("labels.totalWithoutVat") }), _jsx("div", { className: "procurement-kp-fact-value", children: formatValue(selectedDocumentAnalysis.totalWithoutVat) })] }), _jsxs("div", { className: "procurement-kp-fact-card", children: [_jsx("div", { className: "procurement-kp-fact-label", children: t("labels.totalWithVat") }), _jsx("div", { className: "procurement-kp-fact-value", children: formatValue(selectedDocumentAnalysis.totalWithVat) })] })] }), _jsxs("div", { className: "procurement-kp-block", children: [_jsx("div", { className: "procurement-kp-block-title", children: t("labels.extractedItems") }), extractedItems.length > 0 ? (_jsx("div", { className: "procurement-kp-table-wrap", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHeaderCell, { children: t("table.name") }), _jsx(TableHeaderCell, { children: t("table.qty") }), _jsx(TableHeaderCell, { children: t("table.unit") }), _jsx(TableHeaderCell, { children: t("labels.priceWithoutVat") }), _jsx(TableHeaderCell, { children: t("labels.vatPercent") }), _jsx(TableHeaderCell, { children: t("labels.priceWithVat") }), _jsx(TableHeaderCell, { children: t("labels.totalWithVat") })] }) }), _jsx(TableBody, { children: extractedItems.map((item, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: formatValue(item.name) }), _jsx(TableCell, { children: formatValue(item.qty) }), _jsx(TableCell, { children: formatValue(item.unit) }), _jsx(TableCell, { children: formatValue(item.price_without_vat) }), _jsx(TableCell, { children: formatValue(item.vat_percent) }), _jsx(TableCell, { children: formatValue(item.price_with_vat) }), _jsx(TableCell, { children: formatValue(item.total_with_vat) })] }, `${item.name || "item"}-${index}`))) })] }) })) : (_jsx(EmptyState, { title: t("empty.noKpExtractedItemsTitle"), description: t("empty.noKpExtractedItemsDescription") }))] }), (selectedDocumentAnalysis.missingFields ||
                                                                        selectedDocumentAnalysis.notes) && (_jsxs("div", { className: "procurement-kp-block", children: [selectedDocumentAnalysis.missingFields && (_jsxs("div", { className: "procurement-kp-note-item", children: [_jsx("div", { className: "procurement-kp-note-title", children: t("labels.missingFields") }), _jsx("div", { className: "procurement-kp-note-text", children: selectedDocumentAnalysis.missingFields })] })), selectedDocumentAnalysis.notes && (_jsxs("div", { className: "procurement-kp-note-item", children: [_jsx("div", { className: "procurement-kp-note-title", children: t("labels.notes") }), _jsx("div", { className: "procurement-kp-note-text", children: selectedDocumentAnalysis.notes })] }))] }))] })) : (_jsx(EmptyState, { title: t("empty.noKpExtractionTitle"), description: t("empty.noKpExtractionDescription", {
                                                                    name: selectedDocumentName,
                                                                }) })) }))] }), _jsxs(Card, { className: "procurement-card procurement-kp-workspace-panel", children: [_jsxs(CardHeader, { className: "procurement-kp-section-header", children: [_jsxs("div", { className: "procurement-kp-section-heading", children: [_jsx(CardTitle, { children: t("sections.kpDataAnalysis") }), _jsx("div", { className: "procurement-kp-panel-status", children: _jsx(Tag, { variant: getStatusVariant(analysisStatus), children: t(`labels.kpStatus.${analysisStatus || "not_started"}`) }) })] }), _jsxs("div", { className: "procurement-kp-section-actions", children: [_jsx(Button, { onClick: () => void handleAnalyzeKp(selectedDocument.id), disabled: !canAnalyze ||
                                                                                isAnalyzingKp ||
                                                                                isDeletingKp ||
                                                                                isExtractingKp, children: isAnalyzingKp
                                                                                ? t("actions.analyzingData")
                                                                                : t("actions.analyzeData") }), _jsx(Button, { variant: "ghost", size: "sm", className: "procurement-kp-section-toggle", onClick: () => setIsAnalysisCollapsed((value) => !value), endIcon: _jsx(ChevronDown, { className: `procurement-kp-toggle-icon${isAnalysisCollapsed ? " procurement-kp-toggle-icon--collapsed" : ""}` }), children: analysisToggleLabel })] })] }), !isAnalysisCollapsed && (_jsx(CardContent, { children: analysisStatus === "completed" &&
                                                                selectedDocumentAnalysis ? (_jsxs("div", { className: "procurement-kp-report", children: [_jsxs("div", { className: "procurement-kp-summary", children: [_jsx("div", { className: "procurement-kp-block-title", children: t("labels.summary") }), _jsx("div", { className: "procurement-kp-note-text", children: formatValue(selectedDocumentAnalysis.summary) })] }), _jsxs("div", { className: "procurement-kp-block", children: [_jsx("div", { className: "procurement-kp-block-title", children: t("labels.standardChecks") }), standardChecks.length > 0 ? (_jsx("div", { className: "procurement-kp-checks-list", children: standardChecks.map((check, index) => (_jsxs("div", { className: "procurement-kp-check-item", children: [_jsx("div", { className: "procurement-kp-check-title", children: check.check ||
                                                                                                check.criterion ||
                                                                                                t("labels.checkFallback", {
                                                                                                    index: index + 1,
                                                                                                }) }), _jsx("div", { className: "procurement-kp-check-comment", children: formatValue(check.comment) }), check.evidence && (_jsxs("div", { className: "procurement-kp-check-evidence", children: [t("labels.evidence"), ":", " ", check.evidence] }))] }, `${check.check || check.criterion || "check"}-${index}`))) })) : (_jsx(EmptyState, { title: t("empty.noStandardChecksTitle"), description: t("empty.noStandardChecksDescription") }))] }), _jsxs("div", { className: "procurement-kp-block", children: [_jsx("div", { className: "procurement-kp-block-title", children: t("labels.criteriaEvaluation") }), criteriaEvaluation.length > 0 ? (_jsx("div", { className: "procurement-kp-checks-list", children: criteriaEvaluation.map((criterion, index) => (_jsxs("div", { className: "procurement-kp-check-item", children: [_jsx("div", { className: "procurement-kp-check-title", children: criterion.criterion ||
                                                                                                t("labels.criteriaCommentFallback", {
                                                                                                    index: index + 1,
                                                                                                }) }), _jsx("div", { className: "procurement-kp-check-comment", children: formatValue(criterion.comment) }), criterion.evidence && (_jsxs("div", { className: "procurement-kp-check-evidence", children: [t("labels.evidence"), ":", " ", criterion.evidence] }))] }, `${criterion.criterion || "criterion"}-${index}`))) })) : (_jsx("div", { className: "procurement-kp-note-text", children: t("empty.noCriteriaEvaluationDescription") }))] }), (selectedDocumentAnalysis.missingFields ||
                                                                        selectedDocumentAnalysis.notes) && (_jsxs("div", { className: "procurement-kp-block", children: [selectedDocumentAnalysis.missingFields && (_jsxs("div", { className: "procurement-kp-note-item", children: [_jsx("div", { className: "procurement-kp-note-title", children: t("labels.missingFields") }), _jsx("div", { className: "procurement-kp-note-text", children: selectedDocumentAnalysis.missingFields })] })), selectedDocumentAnalysis.notes && (_jsxs("div", { className: "procurement-kp-note-item", children: [_jsx("div", { className: "procurement-kp-note-title", children: t("labels.notes") }), _jsx("div", { className: "procurement-kp-note-text", children: selectedDocumentAnalysis.notes })] }))] }))] })) : (_jsx(EmptyState, { title: t("empty.noSelectedKpAnalysisTitle"), description: canAnalyze
                                                                    ? t("empty.noSelectedKpAnalysisDescription", {
                                                                        name: selectedDocumentName,
                                                                    })
                                                                    : t("empty.kpAnalysisBlockedDescription") })) }))] })] })] })) })] }))] }), _jsx(ConfirmationDialog, { open: deleteConfirmDocument !== null, title: t("dialogs.deleteKpTitle"), description: t("dialogs.deleteKpDescription", {
                    name: deleteConfirmDocument?.fileName ||
                        deleteConfirmDocument?.id ||
                        tCommon("item"),
                }), onOpenChange: (open) => {
                    if (!open) {
                        setDeleteConfirmDocument(null);
                    }
                }, onConfirm: () => {
                    if (!deleteConfirmDocument) {
                        return;
                    }
                    void handleDeleteKp(deleteConfirmDocument.id);
                    setDeleteConfirmDocument(null);
                }, onCancel: () => setDeleteConfirmDocument(null) })] }));
}
//# sourceMappingURL=ProcurementKpTab.js.map