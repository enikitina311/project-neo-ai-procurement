import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Loader, } from "@enikitina311/ui";
export function ProcurementLettersTab({ handleGenerateLetters, isGeneratingLetters, letters, suppliers, suppliersCount, }) {
    const { t } = useTranslation("procurement");
    const { t: tCommon } = useTranslation("common");
    const [selectedLetterId, setSelectedLetterId] = useState(null);
    const suppliersById = useMemo(() => new Map(suppliers.map((supplier) => [
        supplier.id,
        {
            name: supplier.name,
            email: supplier.email,
        },
    ])), [suppliers]);
    const selectedSuppliersCount = useMemo(() => suppliers.filter((supplier) => supplier.selected).length, [suppliers]);
    const lettersWithSupplier = useMemo(() => letters.map((letter) => {
        const supplier = suppliersById.get(letter.supplierId);
        const body = letter.body || "";
        const preview = body.replace(/\s+/g, " ").trim();
        return {
            ...letter,
            supplierName: supplier?.name || t("fields.supplier"),
            supplierEmail: supplier?.email || "",
            preview,
        };
    }), [letters, suppliersById, t]);
    useEffect(() => {
        if (lettersWithSupplier.length === 0) {
            setSelectedLetterId(null);
            return;
        }
        const hasSelected = lettersWithSupplier.some((letter) => letter.id === selectedLetterId);
        if (!hasSelected) {
            setSelectedLetterId(lettersWithSupplier[0].id);
        }
    }, [lettersWithSupplier, selectedLetterId]);
    const selectedLetter = useMemo(() => lettersWithSupplier.find((letter) => letter.id === selectedLetterId) ||
        lettersWithSupplier[0] ||
        null, [lettersWithSupplier, selectedLetterId]);
    const generationScopeText = selectedSuppliersCount > 0
        ? t("labels.lettersSelectedSuppliersScope", {
            count: selectedSuppliersCount,
        })
        : t("labels.lettersAllSuppliersScope", { count: suppliersCount });
    const handleCopy = useCallback(async (value, successMessage) => {
        if (!value?.trim()) {
            return;
        }
        try {
            await navigator.clipboard.writeText(value);
            toast.success(successMessage);
        }
        catch {
            toast.error(tCommon("error"), {
                description: t("errors.copyFailedDescription"),
            });
        }
    }, [t, tCommon]);
    return (_jsxs("div", { className: "procurement-section", children: [_jsxs("div", { className: "procurement-letters-toolbar", children: [_jsxs("div", { className: "procurement-letters-toolbar-copy", children: [_jsx("div", { className: "procurement-subtitle", children: t("sections.lettersDrafts") }), _jsx("div", { className: "procurement-threshold", children: generationScopeText })] }), _jsx(Button, { onClick: handleGenerateLetters, disabled: isGeneratingLetters || suppliersCount === 0, children: isGeneratingLetters
                            ? t("actions.generatingLetters")
                            : t("actions.generateLetters") })] }), suppliersCount === 0 ? (_jsx(EmptyState, { title: t("empty.noLetterSuppliersTitle"), description: t("empty.noLetterSuppliersDescription") })) : isGeneratingLetters ? (_jsx(Card, { className: "procurement-card", children: _jsx(CardContent, { className: "procurement-letters-loader-card", children: _jsx(Loader, { size: "lg", caption: t("actions.generatingLetters") }) }) })) : lettersWithSupplier.length === 0 ? (_jsx(EmptyState, { title: t("empty.noLettersTitle"), description: t("empty.noLettersDescription") })) : (_jsxs("div", { className: "procurement-letters-workspace", children: [_jsxs(Card, { className: "procurement-card procurement-letters-panel", children: [_jsx(CardHeader, { className: "procurement-letters-panel-header", children: _jsxs(CardTitle, { children: [t("sections.lettersDrafts"), " (", lettersWithSupplier.length, ")"] }) }), _jsx(CardContent, { className: "procurement-letters-list", children: lettersWithSupplier.map((letter) => (_jsxs("button", { type: "button", className: [
                                        "procurement-letter-list-item",
                                        letter.id === selectedLetter?.id &&
                                            "procurement-letter-list-item--active",
                                    ]
                                        .filter(Boolean)
                                        .join(" "), onClick: () => setSelectedLetterId(letter.id), children: [_jsxs("div", { className: "procurement-letter-list-item-header", children: [_jsx("div", { className: "procurement-letter-list-item-supplier", children: letter.supplierName }), letter.supplierEmail && (_jsx("div", { className: "procurement-letter-list-item-email", children: letter.supplierEmail }))] }), _jsx("div", { className: "procurement-letter-list-item-subject", children: letter.subject || t("labels.noSubject") }), _jsx("div", { className: "procurement-letter-list-item-preview", children: letter.preview || t("labels.noLetterBody") })] }, letter.id))) })] }), _jsx(Card, { className: "procurement-card procurement-letters-panel", children: selectedLetter ? (_jsxs(_Fragment, { children: [_jsxs(CardHeader, { className: "procurement-letters-preview-header", children: [_jsxs("div", { className: "procurement-letters-preview-meta", children: [_jsx("div", { className: "procurement-letter-preview-label", children: t("labels.letterRecipient") }), _jsx(CardTitle, { children: selectedLetter.supplierName }), selectedLetter.supplierEmail && (_jsx("div", { className: "procurement-threshold", children: selectedLetter.supplierEmail }))] }), _jsxs("div", { className: "procurement-letters-preview-actions", children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleCopy(selectedLetter.subject, t("labels.letterSubjectCopied")), children: t("actions.copySubject") }), _jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleCopy(selectedLetter.body, t("labels.letterBodyCopied")), children: t("actions.copyBody") })] })] }), _jsxs(CardContent, { className: "procurement-letters-preview-content", children: [_jsxs("div", { className: "procurement-letter-preview-section", children: [_jsx("div", { className: "procurement-letter-preview-label", children: t("labels.letterSubject") }), _jsx("div", { className: "procurement-letter-preview-subject", children: selectedLetter.subject || t("labels.noSubject") })] }), _jsxs("div", { className: "procurement-letter-preview-section", children: [_jsx("div", { className: "procurement-letter-preview-label", children: t("tabs.letters") }), _jsx("div", { className: "procurement-letter-preview-body", children: selectedLetter.body || t("labels.noLetterBody") })] })] })] })) : (_jsx(CardContent, { className: "procurement-letters-empty-preview", children: _jsx(EmptyState, { title: t("empty.selectLetterTitle"), description: t("empty.selectLetterDescription") }) })) })] }))] }));
}
//# sourceMappingURL=ProcurementLettersTab.js.map