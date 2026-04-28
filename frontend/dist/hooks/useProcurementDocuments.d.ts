import { type Dispatch, type SetStateAction } from "react";
import { type ExecutePayload, type ProcurementKpAnalysis, type ProcurementKpDocument, type ProcurementLetter, type ProcurementNmcResult } from "../services/api";
type BuildPayload = (functionName: string, values: ExecutePayload["values"]) => ExecutePayload;
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
export declare function useProcurementDocuments({ buildPayload, kpDocuments, packageId, projectId, serviceId, setKpAnalysis, setKpDocuments, setLetters, setNmcResult, }: UseProcurementDocumentsParams): {
    handleAnalyzeKp: (kpDocumentId: string) => Promise<void>;
    handleExtractKp: (kpDocumentId: string) => Promise<void>;
    handleDeleteKp: (kpDocumentId: string) => Promise<void>;
    handleGenerateLetters: () => Promise<void>;
    handleGenerateNmc: () => Promise<void>;
    handleOpenKp: (fileId: string, fileName?: string | null) => Promise<void>;
    handleSelectKpDocument: (kpDocumentId: string) => Promise<void>;
    handleUploadKp: (file: File | null) => Promise<void>;
    isExtractingKp: boolean;
    isAnalyzingKp: boolean;
    isDeletingKp: boolean;
    isGeneratingLetters: boolean;
    isGeneratingNmc: boolean;
    isUploadingKp: boolean;
    selectedKpDocumentId: string | null;
};
export {};
//# sourceMappingURL=useProcurementDocuments.d.ts.map