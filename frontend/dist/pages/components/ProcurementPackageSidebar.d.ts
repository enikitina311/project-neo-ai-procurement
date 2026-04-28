interface ProcurementPackageSidebarProps {
    coverageThreshold: string;
    criteria: string;
    expandButton?: React.ReactNode;
    hasUnsavedChanges: boolean;
    isCreateMode: boolean;
    isSaveDisabled: boolean;
    onBackToList: () => void;
    onCoverageThresholdChange: (value: string) => void;
    onCreatePackage: () => void;
    onCriteriaChange: (value: string) => void;
    onNameChange: (value: string) => void;
    onSuppliersLimitChange: (value: string) => void;
    onUpdatePackage: () => void;
    packageName: string;
    suppliersLimit: string;
}
export declare function ProcurementPackageSidebar({ coverageThreshold, criteria, expandButton, hasUnsavedChanges, isCreateMode, isSaveDisabled, onBackToList, onCoverageThresholdChange, onCreatePackage, onCriteriaChange, onNameChange, onSuppliersLimitChange, onUpdatePackage, packageName, suppliersLimit, }: ProcurementPackageSidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProcurementPackageSidebar.d.ts.map