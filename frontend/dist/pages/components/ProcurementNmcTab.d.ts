import { type ProcurementNmcResult } from "../../services/api";
interface ProcurementNmcTabProps {
    handleGenerateNmc: () => void | Promise<void>;
    isGeneratingNmc: boolean;
    nmcResult: ProcurementNmcResult | null;
}
export declare function ProcurementNmcTab({ handleGenerateNmc, isGeneratingNmc, nmcResult, }: ProcurementNmcTabProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProcurementNmcTab.d.ts.map