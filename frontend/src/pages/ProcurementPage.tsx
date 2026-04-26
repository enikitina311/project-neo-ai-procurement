import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Button,
  EmptyState,
  PageHeader,
  SectionHeader,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@enikitina311/ui";
import { Pencil, Package, Plus, RefreshCw } from "lucide-react";
import {
  listItems,
  listPackages,
  listSuppliers,
  type ExecutePayload,
  type ProcurementItem,
  type ProcurementPackage,
  type ProcurementSupplier,
} from "@/services/api";
import { getProcurementErrorMessage } from "@/lib/errors";
import { buildProcurementExecutePayload } from "@/lib/execute";
import { formatCoverageLabel } from "@/lib/suppliers";
// Legacy CSS removed (Phase 2.7 cleanup track).

function getSupplierUrlLabel(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export default function ProcurementPage() {
  const { t } = useTranslation("procurement");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const { projectId, serviceId } = useParams<{
    projectId?: string;
    serviceId?: string;
  }>();

  const [packages, setPackages] = useState<ProcurementPackage[]>([]);
  const [activePackageId, setActivePackageId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("items");

  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [suppliers, setSuppliers] = useState<ProcurementSupplier[]>([]);
  const [packagesLoadError, setPackagesLoadError] = useState<string | null>(
    null,
  );

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

  const activePackage = useMemo(
    () => packages.find((pkg) => pkg.id === activePackageId) || null,
    [packages, activePackageId],
  );

  const refreshPackages = useCallback(async () => {
    if (!projectId || !serviceId) return;
    setPackagesLoadError(null);

    try {
      const result = await listPackages(
        buildPayload("korus_ai_procurement__package_list", [projectId]),
      );
      setPackages(result);
      if (result.length > 0 && !activePackageId) {
        setActivePackageId(result[0].id);
      }
      if (result.length === 0) {
        setActivePackageId("");
      }
    } catch (error) {
      const message = getProcurementErrorMessage(
        error,
        t("errors.loadPackagesFailedDescription"),
      );
      setPackagesLoadError(message);
      toast.error(t("errors.loadPackagesFailedTitle"), {
        description: message,
      });
    }
  }, [projectId, serviceId, buildPayload, activePackageId, t]);

  const refreshPackageData = useCallback(
    async (packageId: string) => {
      if (!packageId) return;

      try {
        const [itemsResult, suppliersResult] = await Promise.all([
          listItems(
            buildPayload("korus_ai_procurement__items_list", [packageId]),
          ),
          listSuppliers(
            buildPayload("korus_ai_procurement__supplier_list", [packageId]),
          ),
        ]);
        setItems(itemsResult);
        setSuppliers(suppliersResult);
      } catch (error) {
        toast.error(t("errors.loadPackageDataFailedTitle"), {
          description: getProcurementErrorMessage(
            error,
            t("errors.loadPackageDataFailedDescription"),
          ),
        });
      }
    },
    [buildPayload, t],
  );

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
    if (!projectId || !serviceId) return;
    navigate(`/${projectId}/procurement/${serviceId}/create`);
  }, [navigate, projectId, serviceId]);

  const handleEditPackage = useCallback(() => {
    if (!projectId || !serviceId || !activePackageId) return;
    navigate(`/${projectId}/procurement/${serviceId}/${activePackageId}`);
  }, [navigate, projectId, serviceId, activePackageId]);

  const tabs = [
    {
      id: "items",
      label: t("tabs.items"),
      count: items.length,
      content: (
        <div className="procurement-tab-content">
          {items.length === 0 ? (
            <EmptyState
              title={t("empty.noItemsTitle")}
              description={t("empty.noItemsDescription")}
            />
          ) : (
            <div className="procurement-table-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>{t("table.name")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.specs")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.qty")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.unit")}</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.specs}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "suppliers",
      label: t("tabs.suppliers"),
      count: suppliers.length,
      content: (
        <div className="procurement-tab-content">
          {suppliers.length === 0 ? (
            <EmptyState
              title={t("empty.noSuppliersTitle")}
              description={t("empty.noSuppliersDescription")}
            />
          ) : (
            <div className="procurement-table-wrapper">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>{t("table.name")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.url")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.email")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.price")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.unit")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.coverage")}</TableHeaderCell>
                    <TableHeaderCell>{t("table.selected")}</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
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
                      <TableCell>{supplier.price}</TableCell>
                      <TableCell>{supplier.unit}</TableCell>
                      <TableCell>
                        {formatCoverageLabel(
                          items.length,
                          supplier.coverageCount ?? null,
                          supplier.coverageRatio ?? null,
                        )}
                      </TableCell>
                      <TableCell>
                        {supplier.selected ? t("labels.yes") : t("labels.no")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={t("pageTitle")}
        breadcrumbs={[
          { label: tCommon("home"), onClick: () => navigate("/home") },
          { label: t("pageTitle") },
        ]}
      />
      <div className="flex flex-1 overflow-auto p-4 sm:p-6 flex-col gap-4">
        <SectionHeader
          icon={<Package />}
          title={t("sections.packages")}
          actions={
            <>
              <Button
                variant="secondary"
                onClick={refreshPackages}
                startIcon={<RefreshCw />}
              >
                {t("actions.refresh")}
              </Button>
              <Button
                variant="secondary"
                onClick={handleEditPackage}
                startIcon={<Pencil />}
                disabled={!activePackage}
              >
                {t("actions.editPackage")}
              </Button>
              <Button
                variant="secondary"
                onClick={handleAddPackage}
                startIcon={<Plus />}
              >
                {t("actions.addPackage")}
              </Button>
            </>
          }
        />

        {!activePackage && (
          <EmptyState
            title={
              packagesLoadError
                ? t("errors.loadPackagesFailedTitle")
                : t("empty.noPackagesTitle")
            }
            description={packagesLoadError || t("empty.noPackagesDescription")}
          />
        )}

        {activePackage && (
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
        )}
      </div>
    </div>
  );
}
