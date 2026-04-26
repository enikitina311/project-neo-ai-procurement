import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Loader,
} from "@enikitina311/ui";
import type {
  ProcurementLetter,
  ProcurementSupplier,
} from "@/services/api";

interface ProcurementLettersTabProps {
  handleGenerateLetters: () => void | Promise<void>;
  isGeneratingLetters: boolean;
  letters: ProcurementLetter[];
  suppliers: ProcurementSupplier[];
  suppliersCount: number;
}

export function ProcurementLettersTab({
  handleGenerateLetters,
  isGeneratingLetters,
  letters,
  suppliers,
  suppliersCount,
}: ProcurementLettersTabProps) {
  const { t } = useTranslation("procurement");
  const { t: tCommon } = useTranslation("common");
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

  const suppliersById = useMemo(
    () =>
      new Map(
        suppliers.map((supplier) => [
          supplier.id,
          {
            name: supplier.name,
            email: supplier.email,
          },
        ]),
      ),
    [suppliers],
  );

  const selectedSuppliersCount = useMemo(
    () => suppliers.filter((supplier) => supplier.selected).length,
    [suppliers],
  );

  const lettersWithSupplier = useMemo(
    () =>
      letters.map((letter) => {
        const supplier = suppliersById.get(letter.supplierId);
        const body = letter.body || "";
        const preview = body.replace(/\s+/g, " ").trim();

        return {
          ...letter,
          supplierName: supplier?.name || t("fields.supplier"),
          supplierEmail: supplier?.email || "",
          preview,
        };
      }),
    [letters, suppliersById, t],
  );

  useEffect(() => {
    if (lettersWithSupplier.length === 0) {
      setSelectedLetterId(null);
      return;
    }

    const hasSelected = lettersWithSupplier.some(
      (letter) => letter.id === selectedLetterId,
    );

    if (!hasSelected) {
      setSelectedLetterId(lettersWithSupplier[0].id);
    }
  }, [lettersWithSupplier, selectedLetterId]);

  const selectedLetter = useMemo(
    () =>
      lettersWithSupplier.find((letter) => letter.id === selectedLetterId) ||
      lettersWithSupplier[0] ||
      null,
    [lettersWithSupplier, selectedLetterId],
  );

  const generationScopeText =
    selectedSuppliersCount > 0
      ? t("labels.lettersSelectedSuppliersScope", {
          count: selectedSuppliersCount,
        })
      : t("labels.lettersAllSuppliersScope", { count: suppliersCount });

  const handleCopy = useCallback(
    async (value: string | null | undefined, successMessage: string) => {
      if (!value?.trim()) {
        return;
      }

      try {
        await navigator.clipboard.writeText(value);
        toast.success(successMessage);
      } catch {
        toast.error(tCommon("error"), {
          description: t("errors.copyFailedDescription"),
        });
      }
    },
    [t, tCommon],
  );

  return (
    <div className="procurement-section">
      <div className="procurement-letters-toolbar">
        <div className="procurement-letters-toolbar-copy">
          <div className="procurement-subtitle">
            {t("sections.lettersDrafts")}
          </div>
          <div className="procurement-threshold">{generationScopeText}</div>
        </div>
        <Button
          onClick={handleGenerateLetters}
          disabled={isGeneratingLetters || suppliersCount === 0}
        >
          {isGeneratingLetters
            ? t("actions.generatingLetters")
            : t("actions.generateLetters")}
        </Button>
      </div>

      {suppliersCount === 0 ? (
        <EmptyState
          title={t("empty.noLetterSuppliersTitle")}
          description={t("empty.noLetterSuppliersDescription")}
        />
      ) : isGeneratingLetters ? (
        <Card className="procurement-card">
          <CardContent className="procurement-letters-loader-card">
            <Loader size="lg" caption={t("actions.generatingLetters")} />
          </CardContent>
        </Card>
      ) : lettersWithSupplier.length === 0 ? (
        <EmptyState
          title={t("empty.noLettersTitle")}
          description={t("empty.noLettersDescription")}
        />
      ) : (
        <div className="procurement-letters-workspace">
          <Card className="procurement-card procurement-letters-panel">
            <CardHeader className="procurement-letters-panel-header">
              <CardTitle>
                {t("sections.lettersDrafts")} ({lettersWithSupplier.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="procurement-letters-list">
              {lettersWithSupplier.map((letter) => (
                <button
                  key={letter.id}
                  type="button"
                  className={[
                    "procurement-letter-list-item",
                    letter.id === selectedLetter?.id &&
                      "procurement-letter-list-item--active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedLetterId(letter.id)}
                >
                  <div className="procurement-letter-list-item-header">
                    <div className="procurement-letter-list-item-supplier">
                      {letter.supplierName}
                    </div>
                    {letter.supplierEmail && (
                      <div className="procurement-letter-list-item-email">
                        {letter.supplierEmail}
                      </div>
                    )}
                  </div>
                  <div className="procurement-letter-list-item-subject">
                    {letter.subject || t("labels.noSubject")}
                  </div>
                  <div className="procurement-letter-list-item-preview">
                    {letter.preview || t("labels.noLetterBody")}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="procurement-card procurement-letters-panel">
            {selectedLetter ? (
              <>
                <CardHeader className="procurement-letters-preview-header">
                  <div className="procurement-letters-preview-meta">
                    <div className="procurement-letter-preview-label">
                      {t("labels.letterRecipient")}
                    </div>
                    <CardTitle>{selectedLetter.supplierName}</CardTitle>
                    {selectedLetter.supplierEmail && (
                      <div className="procurement-threshold">
                        {selectedLetter.supplierEmail}
                      </div>
                    )}
                  </div>
                  <div className="procurement-letters-preview-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          selectedLetter.subject,
                          t("labels.letterSubjectCopied"),
                        )
                      }
                    >
                      {t("actions.copySubject")}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          selectedLetter.body,
                          t("labels.letterBodyCopied"),
                        )
                      }
                    >
                      {t("actions.copyBody")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="procurement-letters-preview-content">
                  <div className="procurement-letter-preview-section">
                    <div className="procurement-letter-preview-label">
                      {t("labels.letterSubject")}
                    </div>
                    <div className="procurement-letter-preview-subject">
                      {selectedLetter.subject || t("labels.noSubject")}
                    </div>
                  </div>
                  <div className="procurement-letter-preview-section">
                    <div className="procurement-letter-preview-label">
                      {t("tabs.letters")}
                    </div>
                    <div className="procurement-letter-preview-body">
                      {selectedLetter.body || t("labels.noLetterBody")}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="procurement-letters-empty-preview">
                <EmptyState
                  title={t("empty.selectLetterTitle")}
                  description={t("empty.selectLetterDescription")}
                />
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
