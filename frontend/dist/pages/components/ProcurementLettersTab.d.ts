import type { ProcurementLetter, ProcurementSupplier } from "../../services/api";
interface ProcurementLettersTabProps {
    handleGenerateLetters: () => void | Promise<void>;
    isGeneratingLetters: boolean;
    letters: ProcurementLetter[];
    suppliers: ProcurementSupplier[];
    suppliersCount: number;
}
export declare function ProcurementLettersTab({ handleGenerateLetters, isGeneratingLetters, letters, suppliers, suppliersCount, }: ProcurementLettersTabProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProcurementLettersTab.d.ts.map