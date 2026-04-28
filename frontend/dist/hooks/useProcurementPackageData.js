import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getNmcResult, getPackage, listItems, listKpDocuments, listLetters, listSuppliers, } from "../services/api";
import { getProcurementErrorMessage } from "../lib/errors";
export function useProcurementPackageData({ buildPayload, isCreateMode, packageId, }) {
    const { t } = useTranslation("procurement");
    const [packageData, setPackageData] = useState(null);
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [letters, setLetters] = useState([]);
    const [kpDocuments, setKpDocuments] = useState([]);
    const [kpAnalysis, setKpAnalysis] = useState(null);
    const [nmcResult, setNmcResult] = useState(null);
    const [packageDataError, setPackageDataError] = useState(null);
    const loadPackage = useCallback(async () => {
        if (!packageId) {
            setPackageData(null);
            setPackageDataError(null);
            return;
        }
        setPackageDataError(null);
        try {
            const result = await getPackage(buildPayload("korus_ai_procurement__package_get", [packageId]));
            setPackageData(result);
        }
        catch (error) {
            const message = getProcurementErrorMessage(error, t("errors.loadPackageFailedDescription"));
            setPackageDataError(message);
            setPackageData(null);
            toast.error(t("errors.loadPackageFailedTitle"), {
                description: message,
            });
        }
    }, [packageId, buildPayload, t]);
    const refreshPackageData = useCallback(async (currentPackageId) => {
        setPackageDataError(null);
        try {
            const [itemsResult, suppliersResult, lettersResult, kpDocsResult, nmc] = await Promise.all([
                listItems(buildPayload("korus_ai_procurement__items_list", [
                    currentPackageId,
                ])),
                listSuppliers(buildPayload("korus_ai_procurement__supplier_list", [
                    currentPackageId,
                ])),
                listLetters(buildPayload("korus_ai_procurement__letters_list", [
                    currentPackageId,
                ])),
                listKpDocuments(buildPayload("korus_ai_procurement__kp_documents_list", [
                    currentPackageId,
                ])),
                getNmcResult(buildPayload("korus_ai_procurement__nmc_get", [currentPackageId])),
            ]);
            setItems(itemsResult);
            setSuppliers(suppliersResult);
            setLetters(lettersResult);
            setKpDocuments(kpDocsResult);
            setNmcResult(nmc);
        }
        catch (error) {
            const message = getProcurementErrorMessage(error, t("errors.loadPackageDataFailedDescription"));
            setPackageDataError(message);
            toast.error(t("errors.loadPackageDataFailedTitle"), {
                description: message,
            });
        }
    }, [buildPayload, t]);
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
//# sourceMappingURL=useProcurementPackageData.js.map