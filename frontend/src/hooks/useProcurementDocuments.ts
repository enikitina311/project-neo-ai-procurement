import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  extractKpDocument,
  analyzeKpDocument,
  deleteKpDocument,
  generateLetters,
  generateNmc,
  getKpAnalysis,
  openProcurementFile,
  uploadKpDocument,
  uploadProcurementFile,
  type ExecutePayload,
  type ProcurementKpAnalysis,
  type ProcurementKpDocument,
  type ProcurementLetter,
  type ProcurementNmcResult,
} from "@/services/api";
import { getProcurementErrorMessage } from "@/lib/errors";

type BuildPayload = (
  functionName: string,
  values: ExecutePayload["values"],
) => ExecutePayload;

interface UseProcurementDocumentsParams {
  buildPayload: BuildPayload;
  kpDocuments: ProcurementKpDocument[];
  packageId?: string;
  projectId?: string | null;
  serviceId?: string | null;
  setKpAnalysis: Dispatch<SetStateAction<ProcurementKpAnalysis | null>>;
  setKpDocuments: Dispatch<SetStateAction<ProcurementKpDocument[]>>;
  setLetters: Dispatch<SetStateAction<ProcurementLetter[]>>;
  setNmcResult: Dispatch<SetStateAction<ProcurementNmcResult | null>>;
}

export function useProcurementDocuments({
  buildPayload,
  kpDocuments,
  packageId,
  projectId,
  serviceId,
  setKpAnalysis,
  setKpDocuments,
  setLetters,
  setNmcResult,
}: UseProcurementDocumentsParams) {
  const { t } = useTranslation("procurement");
  const [isGeneratingLetters, setIsGeneratingLetters] = useState(false);
  const [isUploadingKp, setIsUploadingKp] = useState(false);
  const [isExtractingKp, setIsExtractingKp] = useState(false);
  const [isAnalyzingKp, setIsAnalyzingKp] = useState(false);
  const [isDeletingKp, setIsDeletingKp] = useState(false);
  const [isGeneratingNmc, setIsGeneratingNmc] = useState(false);
  const [selectedKpDocumentId, setSelectedKpDocumentId] = useState<
    string | null
  >(null);

  const handleGenerateLetters = useCallback(async () => {
    if (!packageId || isGeneratingLetters) {
      return;
    }

    setIsGeneratingLetters(true);

    try {
      const result = await generateLetters(
        buildPayload("korus_ai_procurement__letters_generate", [packageId]),
      );
      setLetters(result);
    } catch (error) {
      toast.error(t("errors.generateLettersFailedTitle"), {
        description: getProcurementErrorMessage(
          error,
          t("errors.generateLettersFailedDescription"),
        ),
      });
    } finally {
      setIsGeneratingLetters(false);
    }
  }, [packageId, isGeneratingLetters, buildPayload, setLetters, t]);

  const handleUploadKp = useCallback(
    async (file: File | null) => {
      if (!packageId || !projectId || !serviceId || !file) return;

      setIsUploadingKp(true);

      try {
        const uploadResult = await uploadProcurementFile(file, projectId, [
          serviceId,
          packageId,
        ]);
        const created = await uploadKpDocument(
          buildPayload("korus_ai_procurement__kp_upload", [
            packageId,
            uploadResult.id,
          ]),
        );

        setKpDocuments((previousDocuments) => [...previousDocuments, created]);
        setSelectedKpDocumentId(created.id);
        setKpAnalysis(null);
      } catch (error) {
        toast.error(t("errors.uploadKpFailedTitle"), {
          description: getProcurementErrorMessage(
            error,
            t("errors.uploadKpFailedDescription"),
          ),
        });
      } finally {
        setIsUploadingKp(false);
      }
    },
    [
      packageId,
      projectId,
      serviceId,
      buildPayload,
      setKpAnalysis,
      setKpDocuments,
      t,
    ],
  );

  const loadAnalysisForDocument = useCallback(
    async (
      kpDocumentId: string,
      options: {
        silent?: boolean;
      } = {},
    ) => {
      try {
        const result = await getKpAnalysis(
          buildPayload("korus_ai_procurement__kp_analysis_get", [kpDocumentId]),
        );
        setKpAnalysis(result);
        return result;
      } catch (error) {
        setKpAnalysis(null);

        if (!options.silent) {
          toast.error(t("errors.loadKpAnalysisFailedTitle"), {
            description: getProcurementErrorMessage(
              error,
              t("errors.loadKpAnalysisFailedDescription"),
            ),
          });
        }

        return null;
      }
    },
    [buildPayload, setKpAnalysis, t],
  );

  const handleOpenKp = useCallback(
    async (fileId: string, fileName?: string | null) => {
      try {
        await openProcurementFile(fileId, fileName);
      } catch (error) {
        toast.error(t("errors.openKpFailedTitle"), {
          description: getProcurementErrorMessage(
            error,
            t("errors.openKpFailedDescription"),
          ),
        });
      }
    },
    [t],
  );

  const handleAnalyzeKp = useCallback(
    async (kpDocumentId: string) => {
      if (isAnalyzingKp) {
        return;
      }

      setIsAnalyzingKp(true);

      try {
        const result = await analyzeKpDocument(
          buildPayload("korus_ai_procurement__kp_analyze", [kpDocumentId]),
        );
        setSelectedKpDocumentId(kpDocumentId);
        setKpAnalysis(result);
        setKpDocuments((previousDocuments) =>
          previousDocuments.map((document) =>
            document.id === kpDocumentId
              ? {
                  ...document,
                  supplierName: result.supplierName ?? document.supplierName,
                }
              : document,
          ),
        );
      } catch (error) {
        toast.error(t("errors.analyzeKpFailedTitle"), {
          description: getProcurementErrorMessage(
            error,
            t("errors.analyzeKpFailedDescription"),
          ),
        });
      } finally {
        setIsAnalyzingKp(false);
      }
    },
    [buildPayload, isAnalyzingKp, setKpAnalysis, setKpDocuments, t],
  );

  const handleExtractKp = useCallback(
    async (kpDocumentId: string) => {
      if (isExtractingKp) {
        return;
      }

      setIsExtractingKp(true);

      try {
        const result = await extractKpDocument(
          buildPayload("korus_ai_procurement__kp_extract", [kpDocumentId]),
        );
        setSelectedKpDocumentId(kpDocumentId);
        setKpAnalysis(result);
        setKpDocuments((previousDocuments) =>
          previousDocuments.map((document) =>
            document.id === kpDocumentId
              ? {
                  ...document,
                  supplierName: result.supplierName ?? document.supplierName,
                }
              : document,
          ),
        );
      } catch (error) {
        toast.error(t("errors.extractKpFailedTitle"), {
          description: getProcurementErrorMessage(
            error,
            t("errors.extractKpFailedDescription"),
          ),
        });
      } finally {
        setIsExtractingKp(false);
      }
    },
    [buildPayload, isExtractingKp, setKpAnalysis, setKpDocuments, t],
  );

  const handleSelectKpDocument = useCallback(
    async (kpDocumentId: string) => {
      setSelectedKpDocumentId(kpDocumentId);
      await loadAnalysisForDocument(kpDocumentId, { silent: true });
    },
    [loadAnalysisForDocument],
  );

  const handleDeleteKp = useCallback(
    async (kpDocumentId: string) => {
      if (isDeletingKp) {
        return;
      }

      setIsDeletingKp(true);

      try {
        await deleteKpDocument(
          buildPayload("korus_ai_procurement__kp_delete", [kpDocumentId]),
        );
        setKpDocuments((previousDocuments) =>
          previousDocuments.filter((document) => document.id !== kpDocumentId),
        );
        setKpAnalysis((previousAnalysis) =>
          previousAnalysis?.kpDocumentId === kpDocumentId
            ? null
            : previousAnalysis,
        );
      } catch (error) {
        toast.error(t("errors.deleteKpFailedTitle"), {
          description: getProcurementErrorMessage(
            error,
            t("errors.deleteKpFailedDescription"),
          ),
        });
      } finally {
        setIsDeletingKp(false);
      }
    },
    [buildPayload, isDeletingKp, setKpAnalysis, setKpDocuments, t],
  );

  const handleGenerateNmc = useCallback(async () => {
    if (!packageId || isGeneratingNmc) {
      return;
    }

    setIsGeneratingNmc(true);

    try {
      const result = await generateNmc(
        buildPayload("korus_ai_procurement__nmc_generate", [packageId]),
      );
      setNmcResult(result);
    } catch (error) {
      toast.error(t("errors.generateNmcFailedTitle"), {
        description: getProcurementErrorMessage(
          error,
          t("errors.generateNmcFailedDescription"),
        ),
      });
    } finally {
      setIsGeneratingNmc(false);
    }
  }, [packageId, isGeneratingNmc, buildPayload, setNmcResult, t]);

  useEffect(() => {
    const syncSelectedDocument = async () => {
      if (!kpDocuments.length) {
        setSelectedKpDocumentId(null);
        setKpAnalysis(null);
        return;
      }

      if (
        selectedKpDocumentId &&
        kpDocuments.some((document) => document.id === selectedKpDocumentId)
      ) {
        await loadAnalysisForDocument(selectedKpDocumentId, { silent: true });
        return;
      }

      const latestDocument = kpDocuments[kpDocuments.length - 1];
      setSelectedKpDocumentId(latestDocument.id);
      await loadAnalysisForDocument(latestDocument.id, { silent: true });
    };

    void syncSelectedDocument();
  }, [
    kpDocuments,
    loadAnalysisForDocument,
    selectedKpDocumentId,
    setKpAnalysis,
  ]);

  return {
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
  };
}
