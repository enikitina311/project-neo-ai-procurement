import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getNmcResult,
  getPackage,
  listItems,
  listKpDocuments,
  listLetters,
  listSuppliers,
  type ExecutePayload,
  type ProcurementItem,
  type ProcurementKpAnalysis,
  type ProcurementKpDocument,
  type ProcurementLetter,
  type ProcurementNmcResult,
  type ProcurementPackage,
  type ProcurementSupplier,
} from "@/services/api";
import { getProcurementErrorMessage } from "@/lib/errors";

type BuildPayload = (
  functionName: string,
  values: ExecutePayload["values"],
) => ExecutePayload;

interface UseProcurementPackageDataParams {
  buildPayload: BuildPayload;
  isCreateMode: boolean;
  packageId?: string;
}

export function useProcurementPackageData({
  buildPayload,
  isCreateMode,
  packageId,
}: UseProcurementPackageDataParams) {
  const { t } = useTranslation("procurement");
  const [packageData, setPackageData] = useState<ProcurementPackage | null>(
    null,
  );
  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [suppliers, setSuppliers] = useState<ProcurementSupplier[]>([]);
  const [letters, setLetters] = useState<ProcurementLetter[]>([]);
  const [kpDocuments, setKpDocuments] = useState<ProcurementKpDocument[]>([]);
  const [kpAnalysis, setKpAnalysis] = useState<ProcurementKpAnalysis | null>(
    null,
  );
  const [nmcResult, setNmcResult] = useState<ProcurementNmcResult | null>(null);
  const [packageDataError, setPackageDataError] = useState<string | null>(null);

  const loadPackage = useCallback(async () => {
    if (!packageId) {
      setPackageData(null);
      setPackageDataError(null);
      return;
    }

    setPackageDataError(null);

    try {
      const result = await getPackage(
        buildPayload("korus_ai_procurement__package_get", [packageId]),
      );
      setPackageData(result);
    } catch (error) {
      const message = getProcurementErrorMessage(
        error,
        t("errors.loadPackageFailedDescription"),
      );
      setPackageDataError(message);
      setPackageData(null);
      toast.error(t("errors.loadPackageFailedTitle"), {
        description: message,
      });
    }
  }, [packageId, buildPayload, t]);

  const refreshPackageData = useCallback(
    async (currentPackageId: string) => {
      setPackageDataError(null);

      try {
        const [itemsResult, suppliersResult, lettersResult, kpDocsResult, nmc] =
          await Promise.all([
            listItems(
              buildPayload("korus_ai_procurement__items_list", [
                currentPackageId,
              ]),
            ),
            listSuppliers(
              buildPayload("korus_ai_procurement__supplier_list", [
                currentPackageId,
              ]),
            ),
            listLetters(
              buildPayload("korus_ai_procurement__letters_list", [
                currentPackageId,
              ]),
            ),
            listKpDocuments(
              buildPayload("korus_ai_procurement__kp_documents_list", [
                currentPackageId,
              ]),
            ),
            getNmcResult(
              buildPayload("korus_ai_procurement__nmc_get", [currentPackageId]),
            ),
          ]);

        setItems(itemsResult);
        setSuppliers(suppliersResult);
        setLetters(lettersResult);
        setKpDocuments(kpDocsResult);
        setNmcResult(nmc);
      } catch (error) {
        const message = getProcurementErrorMessage(
          error,
          t("errors.loadPackageDataFailedDescription"),
        );
        setPackageDataError(message);
        toast.error(t("errors.loadPackageDataFailedTitle"), {
          description: message,
        });
      }
    },
    [buildPayload, t],
  );

  useEffect(() => {
    if (!isCreateMode) {
      loadPackage();
    }
  }, [isCreateMode, loadPackage]);

  useEffect(() => {
    if (packageId) {
      refreshPackageData(packageId);
      return;
    }

    setPackageData(null);
    setPackageDataError(null);
    setItems([]);
    setSuppliers([]);
    setLetters([]);
    setKpDocuments([]);
    setKpAnalysis(null);
    setNmcResult(null);
  }, [packageId, refreshPackageData]);

  return {
    items,
    kpAnalysis,
    kpDocuments,
    letters,
    loadPackage,
    nmcResult,
    packageData,
    packageDataError,
    refreshPackageData,
    setItems,
    setKpAnalysis,
    setKpDocuments,
    setLetters,
    setNmcResult,
    setPackageData,
    setSuppliers,
    suppliers,
  };
}
