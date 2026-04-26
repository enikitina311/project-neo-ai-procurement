import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  EmptyState,
  FileUpload,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tag,
  type UnUploadedFile,
} from "@enikitina311/ui";
import { ChevronDown, Trash2 } from "lucide-react";
import type {
  ProcurementKpAnalysis,
  ProcurementKpDocument,
} from "@/services/api";

type ExtractedItem = {
  name?: string | null;
  qty?: string | number | null;
  unit?: string | null;
  price_without_vat?: string | number | null;
  vat_percent?: string | number | null;
  price_with_vat?: string | number | null;
  total_with_vat?: string | number | null;
};

type StandardCheck = {
  check?: string | null;
  criterion?: string | null;
  comment?: string | null;
  evidence?: string | null;
};

type CriteriaComment = {
  criterion?: string | null;
  comment?: string | null;
  evidence?: string | null;
};

interface ProcurementKpTabProps {
  handleAnalyzeKp: (kpDocumentId: string) => void | Promise<void>;
  handleExtractKp: (kpDocumentId: string) => void | Promise<void>;
  handleDeleteKp: (kpDocumentId: string) => void | Promise<void>;
  handleOpenKp: (
    fileId: string,
    fileName?: string | null,
  ) => void | Promise<void>;
  handleSelectKpDocument: (kpDocumentId: string) => void | Promise<void>;
  handleUploadKp: (file: File | null) => void | Promise<void>;
  isAnalyzingKp: boolean;
  isDeletingKp: boolean;
  isExtractingKp: boolean;
  isUploadingKp: boolean;
  kpAnalysis: ProcurementKpAnalysis | null;
  kpDocuments: ProcurementKpDocument[];
  selectedKpDocumentId: string | null;
}

function parseJsonArray<T>(value?: string | null): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStatusVariant(
  status?: string | null,
): "success" | "destructive" | "secondary" {
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

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

export function ProcurementKpTab({
  handleAnalyzeKp,
  handleExtractKp,
  handleDeleteKp,
  handleOpenKp,
  handleSelectKpDocument,
  handleUploadKp,
  isAnalyzingKp,
  isDeletingKp,
  isExtractingKp,
  isUploadingKp,
  kpAnalysis,
  kpDocuments,
  selectedKpDocumentId,
}: ProcurementKpTabProps) {
  const { t } = useTranslation("procurement");
  const { t: tCommon } = useTranslation("common");
  const [deleteConfirmDocument, setDeleteConfirmDocument] =
    useState<ProcurementKpDocument | null>(null);
  const [isExtractionCollapsed, setIsExtractionCollapsed] = useState(false);
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false);

  const selectedFiles: UnUploadedFile[] = [];

  const handleFilesChange = useCallback(
    (files: UnUploadedFile[]) => {
      void handleUploadKp(files[0]?.file ?? null);
    },
    [handleUploadKp],
  );

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

    return (
      kpDocuments.find((document) => document.id === selectedKpDocumentId) ||
      kpDocuments[0] ||
      null
    );
  }, [kpDocuments, selectedKpDocumentId]);

  const selectedDocumentAnalysis =
    kpAnalysis?.kpDocumentId === selectedDocument?.id ? kpAnalysis : null;

  const extractedItems = useMemo(
    () =>
      parseJsonArray<ExtractedItem>(
        selectedDocumentAnalysis?.extractedItemsJson,
      ),
    [selectedDocumentAnalysis?.extractedItemsJson],
  );

  const standardChecks = useMemo(
    () =>
      parseJsonArray<StandardCheck>(
        selectedDocumentAnalysis?.standardChecksJson,
      ),
    [selectedDocumentAnalysis?.standardChecksJson],
  );

  const criteriaEvaluation = useMemo(
    () =>
      parseJsonArray<CriteriaComment>(
        selectedDocumentAnalysis?.criteriaEvaluationJson,
      ),
    [selectedDocumentAnalysis?.criteriaEvaluationJson],
  );

  const extractionStatus = selectedDocumentAnalysis?.extractionStatus;
  const analysisStatus = selectedDocumentAnalysis?.analysisStatus;
  const canAnalyze = extractionStatus === "completed" && !isExtractingKp;
  const selectedDocumentName =
    selectedDocument?.fileName || selectedDocument?.id;
  const selectedDocumentUploadedAt = selectedDocument?.uploadedAt
    ? new Date(selectedDocument.uploadedAt).toLocaleString()
    : "—";

  const extractionToggleLabel = isExtractionCollapsed
    ? t("actions.expandSection")
    : t("actions.collapseSection");
  const analysisToggleLabel = isAnalysisCollapsed
    ? t("actions.expandSection")
    : t("actions.collapseSection");

  return (
    <div className="procurement-section">
      <FileUpload
        files={selectedFiles}
        onFilesChange={handleFilesChange}
        accept=".pdf,.png,.jpg,.jpeg"
        multiple={false}
        variant="compact"
        helper={t("labels.kpUploadHelper")}
        disabled={isUploadingKp}
      />

      {isUploadingKp && <Loader size="default" caption={t("actions.uploadingKp")} />}

      <div className="procurement-subsection">
        <div className="procurement-subtitle">{t("sections.kpDocuments")}</div>
        {kpDocuments.length === 0 ? (
          <EmptyState
            title={t("empty.noKpDocumentsTitle")}
            description={t("empty.noKpDocumentsDescription")}
          />
        ) : (
          <div className="procurement-kp-layout">
            <Card className="procurement-card procurement-kp-list-panel">
              <CardHeader className="procurement-kp-list-header">
                <CardTitle>
                  {t("sections.kpDocuments")} ({kpDocuments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="procurement-kp-list">
                {kpDocuments.map((document) => {
                  const isActive = document.id === selectedDocument?.id;

                  return (
                    <div
                      key={document.id}
                      className={`procurement-kp-list-item${isActive ? " procurement-kp-list-item--active" : ""}`}
                    >
                      <button
                        type="button"
                        className="procurement-kp-list-item-main"
                        onClick={() => void handleSelectKpDocument(document.id)}
                      >
                        <div className="procurement-kp-list-item-heading">
                          {document.fileName || document.id}
                        </div>
                        <div className="procurement-kp-list-item-supplier">
                          {document.supplierName ||
                            t("labels.kpSupplierDetectedPending")}
                        </div>
                        <div className="procurement-kp-list-item-date">
                          {document.uploadedAt
                            ? new Date(document.uploadedAt).toLocaleString()
                            : "—"}
                        </div>
                        <div className="procurement-kp-file-meta">
                          {document.id}
                        </div>
                      </button>

                      <div className="procurement-kp-list-item-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleOpenKp(
                              document.fileId,
                              document.fileName,
                            );
                          }}
                        >
                          {t("actions.openKp")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          iconOnly
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteConfirmDocument(document);
                          }}
                          title={t("actions.delete")}
                          disabled={
                            isDeletingKp || isExtractingKp || isAnalyzingKp
                          }
                        >
                          <Trash2 className="icon-sm" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="procurement-kp-detail">
              {!selectedDocument ? (
                <EmptyState
                  title={t("empty.selectKpDocumentTitle")}
                  description={t("empty.selectKpDocumentDescription")}
                />
              ) : (
                <>
                  <Card className="procurement-card procurement-kp-detail-card">
                    <CardContent className="procurement-kp-detail-header">
                      <div className="procurement-kp-detail-heading">
                        <div className="procurement-kp-detail-title">
                          {selectedDocumentName}
                        </div>
                        <div className="procurement-kp-detail-subtitle">
                          {selectedDocument.supplierName ||
                            t("labels.kpSupplierDetectedPending")}
                        </div>
                      </div>

                      <div className="procurement-kp-detail-meta">
                        <div className="procurement-kp-detail-meta-item">
                          <span className="procurement-kp-fact-label">
                            {t("table.uploadedAt")}
                          </span>
                          <span className="procurement-kp-fact-value">
                            {selectedDocumentUploadedAt}
                          </span>
                        </div>
                        <div className="procurement-kp-detail-actions">
                          <Button
                            variant="outline"
                            onClick={() =>
                              void handleOpenKp(
                                selectedDocument.fileId,
                                selectedDocument.fileName,
                              )
                            }
                          >
                            {t("actions.openKp")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="procurement-subtitle">
                    {t("sections.kpAnalysis")}
                  </div>

                  <div className="procurement-kp-workspace">
                    <Card className="procurement-card procurement-kp-workspace-panel">
                      <CardHeader className="procurement-kp-section-header">
                        <div className="procurement-kp-section-heading">
                          <CardTitle>{t("sections.kpExtraction")}</CardTitle>
                          <div className="procurement-kp-panel-status">
                            <Tag variant={getStatusVariant(extractionStatus)}>
                              {t(
                                `labels.kpStatus.${extractionStatus || "not_started"}`,
                              )}
                            </Tag>
                          </div>
                        </div>

                        <div className="procurement-kp-section-actions">
                          <Button
                            onClick={() =>
                              void handleExtractKp(selectedDocument.id)
                            }
                            disabled={
                              isExtractingKp || isDeletingKp || isAnalyzingKp
                            }
                          >
                            {isExtractingKp
                              ? t("actions.extractingData")
                              : t("actions.extractData")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="procurement-kp-section-toggle"
                            onClick={() =>
                              setIsExtractionCollapsed((value) => !value)
                            }
                            endIcon={
                              <ChevronDown
                                className={`procurement-kp-toggle-icon${isExtractionCollapsed ? " procurement-kp-toggle-icon--collapsed" : ""}`}
                              />
                            }
                          >
                            {extractionToggleLabel}
                          </Button>
                        </div>
                      </CardHeader>

                      {!isExtractionCollapsed && (
                        <CardContent>
                          {extractionStatus === "completed" &&
                          selectedDocumentAnalysis ? (
                            <div className="procurement-kp-report">
                              <div className="procurement-kp-facts-grid">
                                <div className="procurement-kp-fact-card">
                                  <div className="procurement-kp-fact-label">
                                    {t("labels.detectedSupplier")}
                                  </div>
                                  <div className="procurement-kp-fact-value">
                                    {formatValue(
                                      selectedDocumentAnalysis.supplierName,
                                    )}
                                  </div>
                                </div>
                                <div className="procurement-kp-fact-card">
                                  <div className="procurement-kp-fact-label">
                                    {t("labels.totalWithoutVat")}
                                  </div>
                                  <div className="procurement-kp-fact-value">
                                    {formatValue(
                                      selectedDocumentAnalysis.totalWithoutVat,
                                    )}
                                  </div>
                                </div>
                                <div className="procurement-kp-fact-card">
                                  <div className="procurement-kp-fact-label">
                                    {t("labels.totalWithVat")}
                                  </div>
                                  <div className="procurement-kp-fact-value">
                                    {formatValue(
                                      selectedDocumentAnalysis.totalWithVat,
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="procurement-kp-block">
                                <div className="procurement-kp-block-title">
                                  {t("labels.extractedItems")}
                                </div>
                                {extractedItems.length > 0 ? (
                                  <div className="procurement-kp-table-wrap">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHeaderCell>
                                            {t("table.name")}
                                          </TableHeaderCell>
                                          <TableHeaderCell>
                                            {t("table.qty")}
                                          </TableHeaderCell>
                                          <TableHeaderCell>
                                            {t("table.unit")}
                                          </TableHeaderCell>
                                          <TableHeaderCell>
                                            {t("labels.priceWithoutVat")}
                                          </TableHeaderCell>
                                          <TableHeaderCell>
                                            {t("labels.vatPercent")}
                                          </TableHeaderCell>
                                          <TableHeaderCell>
                                            {t("labels.priceWithVat")}
                                          </TableHeaderCell>
                                          <TableHeaderCell>
                                            {t("labels.totalWithVat")}
                                          </TableHeaderCell>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {extractedItems.map((item, index) => (
                                          <TableRow
                                            key={`${item.name || "item"}-${index}`}
                                          >
                                            <TableCell>
                                              {formatValue(item.name)}
                                            </TableCell>
                                            <TableCell>
                                              {formatValue(item.qty)}
                                            </TableCell>
                                            <TableCell>
                                              {formatValue(item.unit)}
                                            </TableCell>
                                            <TableCell>
                                              {formatValue(
                                                item.price_without_vat,
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {formatValue(item.vat_percent)}
                                            </TableCell>
                                            <TableCell>
                                              {formatValue(item.price_with_vat)}
                                            </TableCell>
                                            <TableCell>
                                              {formatValue(item.total_with_vat)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                ) : (
                                  <EmptyState
                                    title={t("empty.noKpExtractedItemsTitle")}
                                    description={t(
                                      "empty.noKpExtractedItemsDescription",
                                    )}
                                  />
                                )}
                              </div>

                              {(selectedDocumentAnalysis.missingFields ||
                                selectedDocumentAnalysis.notes) && (
                                <div className="procurement-kp-block">
                                  {selectedDocumentAnalysis.missingFields && (
                                    <div className="procurement-kp-note-item">
                                      <div className="procurement-kp-note-title">
                                        {t("labels.missingFields")}
                                      </div>
                                      <div className="procurement-kp-note-text">
                                        {selectedDocumentAnalysis.missingFields}
                                      </div>
                                    </div>
                                  )}
                                  {selectedDocumentAnalysis.notes && (
                                    <div className="procurement-kp-note-item">
                                      <div className="procurement-kp-note-title">
                                        {t("labels.notes")}
                                      </div>
                                      <div className="procurement-kp-note-text">
                                        {selectedDocumentAnalysis.notes}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <EmptyState
                              title={t("empty.noKpExtractionTitle")}
                              description={t(
                                "empty.noKpExtractionDescription",
                                {
                                  name: selectedDocumentName,
                                },
                              )}
                            />
                          )}
                        </CardContent>
                      )}
                    </Card>

                    <Card className="procurement-card procurement-kp-workspace-panel">
                      <CardHeader className="procurement-kp-section-header">
                        <div className="procurement-kp-section-heading">
                          <CardTitle>{t("sections.kpDataAnalysis")}</CardTitle>
                          <div className="procurement-kp-panel-status">
                            <Tag variant={getStatusVariant(analysisStatus)}>
                              {t(
                                `labels.kpStatus.${analysisStatus || "not_started"}`,
                              )}
                            </Tag>
                          </div>
                        </div>

                        <div className="procurement-kp-section-actions">
                          <Button
                            onClick={() =>
                              void handleAnalyzeKp(selectedDocument.id)
                            }
                            disabled={
                              !canAnalyze ||
                              isAnalyzingKp ||
                              isDeletingKp ||
                              isExtractingKp
                            }
                          >
                            {isAnalyzingKp
                              ? t("actions.analyzingData")
                              : t("actions.analyzeData")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="procurement-kp-section-toggle"
                            onClick={() =>
                              setIsAnalysisCollapsed((value) => !value)
                            }
                            endIcon={
                              <ChevronDown
                                className={`procurement-kp-toggle-icon${isAnalysisCollapsed ? " procurement-kp-toggle-icon--collapsed" : ""}`}
                              />
                            }
                          >
                            {analysisToggleLabel}
                          </Button>
                        </div>
                      </CardHeader>

                      {!isAnalysisCollapsed && (
                        <CardContent>
                          {analysisStatus === "completed" &&
                          selectedDocumentAnalysis ? (
                            <div className="procurement-kp-report">
                              <div className="procurement-kp-summary">
                                <div className="procurement-kp-block-title">
                                  {t("labels.summary")}
                                </div>
                                <div className="procurement-kp-note-text">
                                  {formatValue(
                                    selectedDocumentAnalysis.summary,
                                  )}
                                </div>
                              </div>

                              <div className="procurement-kp-block">
                                <div className="procurement-kp-block-title">
                                  {t("labels.standardChecks")}
                                </div>
                                {standardChecks.length > 0 ? (
                                  <div className="procurement-kp-checks-list">
                                    {standardChecks.map((check, index) => (
                                      <div
                                        key={`${check.check || check.criterion || "check"}-${index}`}
                                        className="procurement-kp-check-item"
                                      >
                                        <div className="procurement-kp-check-title">
                                          {check.check ||
                                            check.criterion ||
                                            t("labels.checkFallback", {
                                              index: index + 1,
                                            })}
                                        </div>
                                        <div className="procurement-kp-check-comment">
                                          {formatValue(check.comment)}
                                        </div>
                                        {check.evidence && (
                                          <div className="procurement-kp-check-evidence">
                                            {t("labels.evidence")}:{" "}
                                            {check.evidence}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <EmptyState
                                    title={t("empty.noStandardChecksTitle")}
                                    description={t(
                                      "empty.noStandardChecksDescription",
                                    )}
                                  />
                                )}
                              </div>

                              <div className="procurement-kp-block">
                                <div className="procurement-kp-block-title">
                                  {t("labels.criteriaEvaluation")}
                                </div>
                                {criteriaEvaluation.length > 0 ? (
                                  <div className="procurement-kp-checks-list">
                                    {criteriaEvaluation.map(
                                      (criterion, index) => (
                                        <div
                                          key={`${criterion.criterion || "criterion"}-${index}`}
                                          className="procurement-kp-check-item"
                                        >
                                          <div className="procurement-kp-check-title">
                                            {criterion.criterion ||
                                              t(
                                                "labels.criteriaCommentFallback",
                                                {
                                                  index: index + 1,
                                                },
                                              )}
                                          </div>
                                          <div className="procurement-kp-check-comment">
                                            {formatValue(criterion.comment)}
                                          </div>
                                          {criterion.evidence && (
                                            <div className="procurement-kp-check-evidence">
                                              {t("labels.evidence")}:{" "}
                                              {criterion.evidence}
                                            </div>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <div className="procurement-kp-note-text">
                                    {t("empty.noCriteriaEvaluationDescription")}
                                  </div>
                                )}
                              </div>

                              {(selectedDocumentAnalysis.missingFields ||
                                selectedDocumentAnalysis.notes) && (
                                <div className="procurement-kp-block">
                                  {selectedDocumentAnalysis.missingFields && (
                                    <div className="procurement-kp-note-item">
                                      <div className="procurement-kp-note-title">
                                        {t("labels.missingFields")}
                                      </div>
                                      <div className="procurement-kp-note-text">
                                        {selectedDocumentAnalysis.missingFields}
                                      </div>
                                    </div>
                                  )}
                                  {selectedDocumentAnalysis.notes && (
                                    <div className="procurement-kp-note-item">
                                      <div className="procurement-kp-note-title">
                                        {t("labels.notes")}
                                      </div>
                                      <div className="procurement-kp-note-text">
                                        {selectedDocumentAnalysis.notes}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <EmptyState
                              title={t("empty.noSelectedKpAnalysisTitle")}
                              description={
                                canAnalyze
                                  ? t("empty.noSelectedKpAnalysisDescription", {
                                      name: selectedDocumentName,
                                    })
                                  : t("empty.kpAnalysisBlockedDescription")
                              }
                            />
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={deleteConfirmDocument !== null}
        title={t("dialogs.deleteKpTitle")}
        description={t("dialogs.deleteKpDescription", {
          name:
            deleteConfirmDocument?.fileName ||
            deleteConfirmDocument?.id ||
            tCommon("item"),
        })}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmDocument(null);
          }
        }}
        onConfirm={() => {
          if (!deleteConfirmDocument) {
            return;
          }

          void handleDeleteKp(deleteConfirmDocument.id);
          setDeleteConfirmDocument(null);
        }}
        onCancel={() => setDeleteConfirmDocument(null)}
      />
    </div>
  );
}
