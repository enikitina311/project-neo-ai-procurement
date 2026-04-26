import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useProcurementDocuments } from "@/hooks/useProcurementDocuments";
import { useProcurementPackageData } from "@/hooks/useProcurementPackageData";
import { useProcurementSuppliers } from "@/hooks/useProcurementSuppliers";
import { getProcurementErrorMessage } from "@/lib/errors";
import { buildProcurementExecutePayload } from "@/lib/execute";
import {
  EmptyState,
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@enikitina311/ui";
import {
  createItem,
  createPackage,
  deleteItem,
  updateItem,
  updatePackage,
  type ExecutePayload,
} from "@/services/api";
import {
  ProcurementItemsTab,
  ProcurementKpTab,
  ProcurementLettersTab,
  ProcurementNmcTab,
  ProcurementPackageSidebar,
  ProcurementSuppliersTab,
} from "./components";
// Legacy CSS removed (Phase 2.7 cleanup track).

export default function ProcurementPackagePage() {
  const { t } = useTranslation("procurement");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const { packageId, projectId, serviceId } = useParams<{
    packageId?: string;
    projectId?: string;
    serviceId?: string;
  }>();

  const isCreateMode = !packageId;

  const [activeTab, setActiveTab] = useState("items");
  const [formName, setFormName] = useState("");
  const [formCriteria, setFormCriteria] = useState("");
  const [formCoverageThreshold, setFormCoverageThreshold] = useState("70");
  const [formSuppliersLimit, setFormSuppliersLimit] = useState("10");
  const [newItemName, setNewItemName] = useState("");
  const [newItemSpecs, setNewItemSpecs] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [itemAddVersion, setItemAddVersion] = useState(0);

  const isAddingRef = useRef(false);

  // Host's currentPage state derived from URL — plugin не диспатчит.

  const buildPayload = useCallback(
    (functionName: string, values: ExecutePayload["values"]) =>
      buildProcurementExecutePayload(
        functionName,
        values,
        projectId,
        serviceId,
      ),
    [projectId, serviceId],
  );

  const {
    items,
    kpAnalysis,
    kpDocuments,
    letters,
    loadPackage,
    nmcResult,
    packageData,
    packageDataError,
    setItems,
    setKpAnalysis,
    setKpDocuments,
    setLetters,
    setNmcResult,
    setPackageData,
    setSuppliers,
    suppliers,
  } = useProcurementPackageData({
    buildPayload,
    isCreateMode,
    packageId,
  });

  useEffect(() => {
    setActiveTab("items");

    if (!packageId) {
      setFormName("");
      setFormCriteria("");
      setFormCoverageThreshold("70");
      setFormSuppliersLimit("10");
      setNewItemName("");
      setNewItemSpecs("");
      setNewItemQty("");
      setNewItemUnit("");
    }
  }, [packageId]);

  useEffect(() => {
    if (!packageData) {
      return;
    }

    setFormName(packageData.name || "");
    setFormCriteria(packageData.criteriaText || "");
    const threshold =
      packageData.coverageThreshold !== null &&
      packageData.coverageThreshold !== undefined
        ? Math.round(packageData.coverageThreshold * 100)
        : 70;
    setFormCoverageThreshold(String(threshold));
    const suppliersLimit =
      packageData.suppliersLimit !== null &&
      packageData.suppliersLimit !== undefined
        ? packageData.suppliersLimit
        : 10;
    setFormSuppliersLimit(String(suppliersLimit));
  }, [packageData]);

  const parseCoverageThreshold = useCallback((value: string) => {
    const normalized = value.replace(",", ".");
    const percent = Number(normalized);
    if (!Number.isFinite(percent)) return 0.7;
    const clamped = Math.min(Math.max(percent, 0), 100);
    return clamped / 100;
  }, []);

  const parseSuppliersLimit = useCallback((value: string) => {
    const normalized = value.replace(",", ".");
    const count = Math.round(Number(normalized));
    if (!Number.isFinite(count)) return 10;
    return Math.max(1, count);
  }, []);

  const savedCoverageThreshold = packageData?.coverageThreshold ?? 0.7;
  const savedCoverageThresholdPercent = Math.round(
    savedCoverageThreshold * 100,
  );
  const savedSuppliersLimit = packageData?.suppliersLimit ?? 10;
  const normalizedCurrentName = formName.trim();
  const normalizedSavedName = packageData?.name?.trim() ?? "";
  const normalizedCurrentCriteria = formCriteria.trim();
  const normalizedSavedCriteria = packageData?.criteriaText?.trim() ?? "";
  const currentCoverageThreshold = parseCoverageThreshold(
    formCoverageThreshold,
  );
  const currentSuppliersLimit = parseSuppliersLimit(formSuppliersLimit);
  const hasUnsavedChanges = isCreateMode
    ? normalizedCurrentName !== "" ||
      normalizedCurrentCriteria !== "" ||
      formCoverageThreshold !== "70" ||
      formSuppliersLimit !== "10"
    : normalizedCurrentName !== normalizedSavedName ||
      normalizedCurrentCriteria !== normalizedSavedCriteria ||
      currentCoverageThreshold !== savedCoverageThreshold ||
      currentSuppliersLimit !== savedSuppliersLimit;
  const isSaveDisabled = isCreateMode
    ? normalizedCurrentName === ""
    : normalizedCurrentName === "" || !hasUnsavedChanges;

  const handleBackToList = useCallback(() => {
    if (!projectId || !serviceId) return;
    navigate(`/${projectId}/procurement/${serviceId}`);
  }, [navigate, projectId, serviceId]);

  const handleCreatePackage = useCallback(async () => {
    if (!projectId || !serviceId || !formName.trim()) return;

    try {
      const created = await createPackage(
        buildPayload("korus_ai_procurement__package_create", [
          projectId,
          formName.trim(),
          formCriteria || null,
          parseCoverageThreshold(formCoverageThreshold),
          parseSuppliersLimit(formSuppliersLimit),
        ]),
      );

      navigate(`/${projectId}/procurement/${serviceId}/${created.id}`);
    } catch (error) {
      toast.error(tCommon("error"), {
        description: getProcurementErrorMessage(
          error,
          t("errors.packageMutationFailed"),
        ),
      });
    }
  }, [
    buildPayload,
    formCriteria,
    formCoverageThreshold,
    formName,
    formSuppliersLimit,
    navigate,
    parseCoverageThreshold,
    parseSuppliersLimit,
    projectId,
    serviceId,
    t,
    tCommon,
  ]);

  const handleUpdatePackage = useCallback(async () => {
    if (!packageId || !projectId || !serviceId) return;

    try {
      const updated = await updatePackage(
        buildPayload("korus_ai_procurement__package_update", [
          packageId,
          projectId,
          formName.trim(),
          formCriteria || null,
          parseCoverageThreshold(formCoverageThreshold),
          parseSuppliersLimit(formSuppliersLimit),
        ]),
      );

      setPackageData(updated);
      await loadPackage();
    } catch (error) {
      toast.error(tCommon("error"), {
        description: getProcurementErrorMessage(
          error,
          t("errors.packageMutationFailed"),
        ),
      });
    }
  }, [
    buildPayload,
    formCriteria,
    formCoverageThreshold,
    formName,
    formSuppliersLimit,
    loadPackage,
    packageId,
    parseCoverageThreshold,
    parseSuppliersLimit,
    projectId,
    serviceId,
    setPackageData,
    t,
    tCommon,
  ]);

  const handleAddItem = useCallback(async () => {
    if (!packageId || !newItemName.trim()) return;

    try {
      const created = await createItem(
        buildPayload("korus_ai_procurement__items_create", [
          packageId,
          newItemName.trim(),
          newItemSpecs || null,
          newItemQty ? Number(newItemQty) : null,
          newItemUnit || null,
        ]),
      );

      setItems((previousItems) => [...previousItems, created]);
      setNewItemName("");
      setNewItemSpecs("");
      setNewItemQty("");
      setNewItemUnit("");
      setItemAddVersion((previous) => previous + 1);
    } catch (error) {
      toast.error(tCommon("error"), {
        description: getProcurementErrorMessage(
          error,
          t("errors.itemMutationFailed"),
        ),
      });
    }
  }, [
    buildPayload,
    newItemName,
    newItemQty,
    newItemSpecs,
    newItemUnit,
    packageId,
    setItems,
    t,
    tCommon,
  ]);

  const handleAddItemIfReady = useCallback(async () => {
    if (isAddingRef.current || !newItemName.trim()) {
      return;
    }

    isAddingRef.current = true;
    try {
      await handleAddItem();
    } finally {
      isAddingRef.current = false;
    }
  }, [handleAddItem, newItemName]);

  const handleUpdateItem = useCallback(
    async (
      itemId: string,
      values: {
        name: string;
        qty: string;
        specs: string;
        unit: string;
      },
    ) => {
      if (!packageId) return;

      const name = values.name.trim();
      const specs = values.specs.trim() ? values.specs : null;
      const qtyRaw = values.qty.trim();
      const parsedQty = qtyRaw === "" ? null : Number(qtyRaw);
      const qty =
        parsedQty === null || !Number.isFinite(parsedQty) ? null : parsedQty;
      const unit = values.unit.trim() ? values.unit : null;

      try {
        const updated = await updateItem(
          buildPayload("korus_ai_procurement__items_update", [
            itemId,
            packageId,
            name,
            specs,
            qty,
            unit,
          ]),
        );

        setItems((previousItems) =>
          previousItems.map((item) =>
            item.id === updated.id ? updated : item,
          ),
        );
      } catch (error) {
        toast.error(tCommon("error"), {
          description: getProcurementErrorMessage(
            error,
            t("errors.itemMutationFailed"),
          ),
        });
      }
    },
    [buildPayload, packageId, setItems, t, tCommon],
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      try {
        await deleteItem(
          buildPayload("korus_ai_procurement__items_delete", [itemId]),
        );
        setItems((previousItems) =>
          previousItems.filter((item) => item.id !== itemId),
        );
      } catch (error) {
        toast.error(tCommon("error"), {
          description: getProcurementErrorMessage(
            error,
            t("errors.itemMutationFailed"),
          ),
        });
      }
    },
    [buildPayload, setItems, t, tCommon],
  );

  const {
    filteredSearchSuppliers,
    handleCancelSearchSuppliers,
    handleDeleteSupplier,
    handleSearchSuppliers,
    handleToggleSearchSupplier,
    handleTransferSelectedSuppliers,
    isSearchingSuppliers,
    isTransferringSuppliers,
    noSuppliersFound,
    noSuppliersMeetThreshold,
    searchResult,
    selectedSearchSuppliers,
    showSearchError,
  } = useProcurementSuppliers({
    buildPayload,
    itemsCount: items.length,
    packageId,
    savedCoverageThreshold,
    setSuppliers,
    suppliers,
    t,
  });

  const {
    handleAnalyzeKp,
    handleExtractKp,
    handleDeleteKp,
    handleGenerateLetters,
    handleGenerateNmc,
    handleOpenKp,
    handleSelectKpDocument,
    handleUploadKp,
    isExtractingKp,
    isAnalyzingKp,
    isDeletingKp,
    isGeneratingLetters,
    isGeneratingNmc,
    isUploadingKp,
    selectedKpDocumentId,
  } = useProcurementDocuments({
    buildPayload,
    kpDocuments,
    packageId,
    projectId,
    serviceId,
    setKpAnalysis,
    setKpDocuments,
    setLetters,
    setNmcResult,
  });

  const tabs = [
    {
      id: "items",
      label: t("tabs.items"),
      count: items.length,
      disabled: isCreateMode,
      tooltip: isCreateMode ? t("empty.createPackageDescription") : undefined,
      content: (
        <ProcurementItemsTab
          handleAddItemIfReady={handleAddItemIfReady}
          handleDeleteItem={handleDeleteItem}
          handleUpdateItem={handleUpdateItem}
          isCreateMode={isCreateMode}
          itemAddVersion={itemAddVersion}
          items={items}
          newItemName={newItemName}
          newItemQty={newItemQty}
          newItemSpecs={newItemSpecs}
          newItemUnit={newItemUnit}
          onNewItemNameChange={setNewItemName}
          onNewItemQtyChange={setNewItemQty}
          onNewItemSpecsChange={setNewItemSpecs}
          onNewItemUnitChange={setNewItemUnit}
        />
      ),
    },
    {
      id: "suppliers",
      label: t("tabs.suppliers"),
      count: suppliers.length,
      disabled: isCreateMode,
      tooltip: isCreateMode ? t("empty.createPackageDescription") : undefined,
      content: (
        <ProcurementSuppliersTab
          filteredSearchSuppliers={filteredSearchSuppliers}
          handleCancelSearchSuppliers={handleCancelSearchSuppliers}
          handleDeleteSupplier={handleDeleteSupplier}
          handleSearchSuppliers={handleSearchSuppliers}
          handleToggleSearchSupplier={handleToggleSearchSupplier}
          handleTransferSelectedSuppliers={handleTransferSelectedSuppliers}
          isCreateMode={isCreateMode}
          isSearchingSuppliers={isSearchingSuppliers}
          isTransferringSuppliers={isTransferringSuppliers}
          itemsCount={items.length}
          noSuppliersFound={noSuppliersFound}
          noSuppliersMeetThreshold={noSuppliersMeetThreshold}
          savedCoverageThreshold={savedCoverageThreshold}
          savedCoverageThresholdPercent={savedCoverageThresholdPercent}
          savedSuppliersLimit={savedSuppliersLimit}
          searchResultRaw={
            searchResult?.raw && !searchResult.parsed?.suppliers
              ? searchResult.raw
              : undefined
          }
          selectedSearchSuppliers={selectedSearchSuppliers}
          showSearchError={showSearchError}
          suppliers={suppliers}
        />
      ),
    },
    {
      id: "letters",
      label: t("tabs.letters"),
      count: letters.length,
      disabled: isCreateMode,
      tooltip: isCreateMode ? t("empty.createPackageDescription") : undefined,
      content: (
        <ProcurementLettersTab
          handleGenerateLetters={handleGenerateLetters}
          isGeneratingLetters={isGeneratingLetters}
          letters={letters}
          suppliers={suppliers}
          suppliersCount={suppliers.length}
        />
      ),
    },
    {
      id: "kp",
      label: t("tabs.kp"),
      count: kpDocuments.length,
      disabled: isCreateMode,
      tooltip: isCreateMode ? t("empty.createPackageDescription") : undefined,
      content: (
        <ProcurementKpTab
          handleAnalyzeKp={handleAnalyzeKp}
          handleExtractKp={handleExtractKp}
          handleDeleteKp={handleDeleteKp}
          handleOpenKp={handleOpenKp}
          handleSelectKpDocument={handleSelectKpDocument}
          handleUploadKp={handleUploadKp}
          isExtractingKp={isExtractingKp}
          isAnalyzingKp={isAnalyzingKp}
          isDeletingKp={isDeletingKp}
          isUploadingKp={isUploadingKp}
          kpAnalysis={kpAnalysis}
          kpDocuments={kpDocuments}
          selectedKpDocumentId={selectedKpDocumentId}
        />
      ),
    },
    {
      id: "nmc",
      label: t("tabs.nmc"),
      disabled: isCreateMode,
      tooltip: isCreateMode ? t("empty.createPackageDescription") : undefined,
      content: (
        <ProcurementNmcTab
          handleGenerateNmc={handleGenerateNmc}
          isGeneratingNmc={isGeneratingNmc}
          nmcResult={nmcResult}
        />
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={
          isCreateMode
            ? t("sections.createPackage")
            : t("packageTitle", {
                name: packageData?.name || t("sections.package"),
              })
        }
        breadcrumbs={[
          { label: tCommon("home"), onClick: () => navigate("/home") },
          { label: t("pageTitle"), onClick: handleBackToList },
          {
            label: isCreateMode
              ? t("sections.createPackage")
              : packageData?.name || t("sections.package"),
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 sm:p-6">
        <ProcurementPackageSidebar
          coverageThreshold={formCoverageThreshold}
          criteria={formCriteria}
          hasUnsavedChanges={hasUnsavedChanges}
          isCreateMode={isCreateMode}
          isSaveDisabled={isSaveDisabled}
          onBackToList={handleBackToList}
          onCoverageThresholdChange={setFormCoverageThreshold}
          onCreatePackage={handleCreatePackage}
          onCriteriaChange={setFormCriteria}
          onNameChange={setFormName}
          onSuppliersLimitChange={setFormSuppliersLimit}
          onUpdatePackage={handleUpdatePackage}
          packageName={formName}
          suppliersLimit={formSuppliersLimit}
        />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.find((t) => t.id === activeTab)?.content}
        </Tabs>
        {!isCreateMode && packageDataError && !packageData && (
          <EmptyState
            title={t("errors.loadPackageFailedTitle")}
            description={packageDataError}
          />
        )}
        {isCreateMode && (
          <EmptyState
            title={t("empty.createPackageTitle")}
            description={t("empty.createPackageDescription")}
          />
        )}
      </div>
    </div>
  );
}
