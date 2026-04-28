import type { ProcurementKpAnalysis, ProcurementKpDocument } from "../../services/api";
interface ProcurementKpTabProps {
    handleAnalyzeKp: (kpDocumentId: string) => void | Promise<void>;
    handleExtractKp: (kpDocumentId: string) => void | Promise<void>;
    handleDeleteKp: (kpDocumentId: string) => void | Promise<void>;
    handleOpenKp: (fileId: string, fileName?: string | null) => void | Promise<void>;
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
export declare function ProcurementKpTab({ handleAnalyzeKp, handleExtractKp, handleDeleteKp, handleOpenKp, handleSelectKpDocument, handleUploadKp, isAnalyzingKp, isDeletingKp, isExtractingKp, isUploadingKp, kpAnalysis, kpDocuments, selectedKpDocumentId, }: ProcurementKpTabProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProcurementKpTab.d.ts.map