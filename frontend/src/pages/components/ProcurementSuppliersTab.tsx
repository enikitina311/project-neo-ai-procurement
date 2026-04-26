import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Checkbox,
  ConfirmationDialog,
  EmptyState,
  Loader,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tag,
} from "@enikitina311/ui";
import { Trash2 } from "lucide-react";
import type { ProcurementSupplier } from "@/services/api";
import {
  formatCoverageLabel,
  formatMatchedItems,
  getCoverageInfo,
  type SearchSupplier,
} from "@/lib/suppliers";

interface ProcurementSuppliersTabProps {
  filteredSearchSuppliers: SearchSupplier[];
  handleCancelSearchSuppliers: () => void;
  handleDeleteSupplier: (supplierId: string) => void | Promise<void>;
  handleSearchSuppliers: () => void | Promise<void>;
  handleToggleSearchSupplier: (index: number) => void;
  handleTransferSelectedSuppliers: () => boolean | Promise<boolean>;
  isCreateMode: boolean;
  isSearchingSuppliers: boolean;
  isTransferringSuppliers: boolean;
  itemsCount: number;
  noSuppliersFound: boolean;
  noSuppliersMeetThreshold: boolean;
  savedCoverageThreshold: number;
  savedCoverageThresholdPercent: number;
  savedSuppliersLimit: number;
  searchResultRaw?: string;
  selectedSearchSuppliers: Set<number>;
  showSearchError: boolean;
  suppliers: ProcurementSupplier[];
}

function renderCoverageTag(
  totalItems: number,
  coverageCount: number | null | undefined,
  coverageRatio: number | null | undefined,
  threshold: number,
) {
  const coverage = getCoverageInfo(totalItems, coverageCount, coverageRatio);
  const variant: "success" | "secondary" =
    coverage.ratio !== null && coverage.ratio >= threshold
      ? "success"
      : "secondary";

  return (
    <Tag variant={variant} size="sm">
      {formatCoverageLabel(totalItems, coverageCount, coverageRatio)}
    </Tag>
  );
}

function getSupplierUrlLabel(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function ProcurementSuppliersTab({
  filteredSearchSuppliers,
  handleCancelSearchSuppliers,
  handleDeleteSupplier,
  handleSearchSuppliers,
  handleToggleSearchSupplier,
  handleTransferSelectedSuppliers,
  isCreateMode,
  isSearchingSuppliers,
  isTransferringSuppliers,
  itemsCount,
  noSuppliersFound,
  noSuppliersMeetThreshold,
  savedCoverageThreshold,
  savedCoverageThresholdPercent,
  savedSuppliersLimit,
  searchResultRaw,
  selectedSearchSuppliers,
  showSearchError,
  suppliers,
}: ProcurementSuppliersTabProps) {
  const { t } = useTranslation("procurement");
  const { t: tCommon } = useTranslation("common");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [deleteConfirmSupplier, setDeleteConfirmSupplier] =
    useState<ProcurementSupplier | null>(null);

  const existingSupplierNames = useMemo(
    () => new Set(suppliers.map((supplier) => supplier.name.toLowerCase())),
    [suppliers],
  );

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

  return (
    <div className="procurement-section procurement-suppliers-tab">
      <div className="procurement-suppliers-toolbar">
        <div className="procurement-suppliers-meta">
          <span>
            {t("labels.coverageThreshold", {
              value: savedCoverageThresholdPercent,
            })}
          </span>
          <span className="procurement-threshold-separator">•</span>
          <span>
            {t("labels.suppliersLimit", { value: savedSuppliersLimit })}
          </span>
        </div>

        <Button
          onClick={() => setIsSearchModalOpen(true)}
          disabled={isCreateMode || itemsCount === 0}
        >
          {t("actions.findSuppliers")}
        </Button>
      </div>

      <Modal
        open={isSearchModalOpen}
        onOpenChange={(o) => !o && handleCloseSearchModal()}
      >
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>{t("actions.findSuppliers")}</ModalTitle>
          </ModalHeader>
        <div className="flex flex-col gap-3 px-6">
          <div className="procurement-suppliers-meta procurement-suppliers-meta--modal">
            <span>
              {t("labels.coverageThreshold", {
                value: savedCoverageThresholdPercent,
              })}
            </span>
            <span className="procurement-threshold-separator">•</span>
            <span>
              {t("labels.suppliersLimit", { value: savedSuppliersLimit })}
            </span>
          </div>

          {isSearchingSuppliers && (
            <Loader size="default" caption={t("actions.searchingSuppliers")} />
          )}

          {showSearchError && (
            <EmptyState
              title={t("errors.searchFailedTitle")}
              description={t("errors.searchFailedDescription")}
            />
          )}

          {noSuppliersFound && (
            <EmptyState
              title={t("empty.suppliersNotFoundTitle")}
              description={t("empty.suppliersNotFoundDescription")}
            />
          )}

          {noSuppliersMeetThreshold && (
            <EmptyState
              title={t("empty.suppliersBelowThresholdTitle")}
              description={t("empty.suppliersBelowThresholdDescription")}
            />
          )}

          {filteredSearchSuppliers.length > 0 && (
            <div className="procurement-table-wrapper procurement-suppliers-table-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell width="48px">{""}</TableHeaderCell>
                    <TableHeaderCell width="36%">
                      {t("table.name")}
                    </TableHeaderCell>
                    <TableHeaderCell width="26%">
                      {t("table.url")}
                    </TableHeaderCell>
                    <TableHeaderCell width="16%">
                      {t("table.email")}
                    </TableHeaderCell>
                    <TableHeaderCell width="18%">
                      {t("table.coverage")}
                    </TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSearchSuppliers.map((supplier, index) => {
                    const normalizedName = supplier.name?.toLowerCase() || "";
                    const isAlreadyAdded =
                      normalizedName !== "" &&
                      existingSupplierNames.has(normalizedName);
                    const matched = formatMatchedItems(supplier.matchedItems);

                    return (
                      <TableRow key={`${supplier.name}-${index}`}>
                        <TableCell>
                          <Checkbox
                            checked={
                              !isAlreadyAdded &&
                              selectedSearchSuppliers.has(index)
                            }
                            onChange={() => handleToggleSearchSupplier(index)}
                            disabled={
                              isAlreadyAdded ||
                              isSearchingSuppliers ||
                              isTransferringSuppliers
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <div className="procurement-supplier-row-head">
                            <div className="procurement-supplier-name">
                              {supplier.name}
                            </div>
                            {isAlreadyAdded && (
                              <Tag
                                variant="secondary"
                                size="sm"
                                className="procurement-supplier-status-tag"
                              >
                                {t("labels.alreadyAdded")}
                              </Tag>
                            )}
                          </div>
                          {matched ? (
                            <div className="procurement-supplier-items procurement-supplier-items--clamped">
                              {matched}
                            </div>
                          ) : null}
                        </TableCell>

                        <TableCell>
                          {supplier.url ? (
                            <a
                              className="procurement-supplier-link"
                              href={supplier.url}
                              target="_blank"
                              rel="noreferrer"
                              title={supplier.url}
                            >
                              <span className="procurement-supplier-link-text">
                                {getSupplierUrlLabel(supplier.url)}
                              </span>
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>{supplier.email || "-"}</TableCell>

                        <TableCell>
                          {renderCoverageTag(
                            itemsCount,
                            supplier.coverageCount ?? null,
                            supplier.coverageRatio ?? null,
                            savedCoverageThreshold,
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {searchResultRaw && (
            <pre className="procurement-pre">{searchResultRaw}</pre>
          )}
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            type="button"
            onClick={handleCloseSearchModal}
          >
            {tCommon("actions.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleTransferFromModal}
            disabled={
              isSearchingSuppliers ||
              isTransferringSuppliers ||
              selectedSearchSuppliers.size === 0
            }
          >
            {isTransferringSuppliers
              ? t("actions.transferringSuppliers")
              : t("actions.transferSelectedSuppliers")}
          </Button>
        </ModalFooter>
        </ModalContent>
      </Modal>

      {suppliers.length === 0 ? (
        <EmptyState
          title={t("empty.noSuppliersTitle")}
          description={t("empty.noSuppliersDescription")}
        />
      ) : (
        <div className="procurement-table-wrapper procurement-suppliers-table-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell width="38%">{t("table.name")}</TableHeaderCell>
                <TableHeaderCell width="24%">{t("table.url")}</TableHeaderCell>
                <TableHeaderCell width="14%">
                  {t("table.email")}
                </TableHeaderCell>
                <TableHeaderCell width="14%">
                  {t("table.coverage")}
                </TableHeaderCell>
                <TableHeaderCell width="10%" align="right">
                  {t("table.actions")}
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => {
                const matched = formatMatchedItems(
                  undefined,
                  supplier.matchedItemsJson ?? null,
                );

                return (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="procurement-supplier-name">
                        {supplier.name}
                      </div>
                      {matched ? (
                        <div className="procurement-supplier-items procurement-supplier-items--clamped">
                          {matched}
                        </div>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      {supplier.url ? (
                        <a
                          className="procurement-supplier-link"
                          href={supplier.url}
                          target="_blank"
                          rel="noreferrer"
                          title={supplier.url}
                        >
                          <span className="procurement-supplier-link-text">
                            {getSupplierUrlLabel(supplier.url)}
                          </span>
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>{supplier.email || "-"}</TableCell>

                    <TableCell>
                      {renderCoverageTag(
                        itemsCount,
                        supplier.coverageCount ?? null,
                        supplier.coverageRatio ?? null,
                        savedCoverageThreshold,
                      )}
                    </TableCell>

                    <TableCell
                      className="procurement-item-actions-cell"
                      align="right"
                    >
                      <div className="procurement-item-actions-group">
                        <Button
                          variant="outline"
                          iconOnly
                          type="button"
                          onClick={() => setDeleteConfirmSupplier(supplier)}
                          title={t("actions.delete")}
                          disabled={isCreateMode}
                        >
                          <Trash2 className="icon-sm" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmationDialog
        open={deleteConfirmSupplier !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmSupplier(null);
          }
        }}
        onConfirm={async () => {
          if (deleteConfirmSupplier) {
            await handleDeleteSupplier(deleteConfirmSupplier.id);
          }
          setDeleteConfirmSupplier(null);
        }}
        title={t("dialogs.deleteSupplierTitle")}
        description={t("dialogs.deleteSupplierDescription", {
          name: deleteConfirmSupplier?.name ?? "",
        })}
        variant="danger"
        confirmText={tCommon("delete")}
      />
    </div>
  );
}
