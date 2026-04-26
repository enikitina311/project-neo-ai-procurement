import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Label,
  SectionHeader,
  Tag,
  TextArea,
} from "@enikitina311/ui";
import { Package } from "lucide-react";

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

export function ProcurementPackageSidebar({
  coverageThreshold,
  criteria,
  expandButton,
  hasUnsavedChanges,
  isCreateMode,
  isSaveDisabled,
  onBackToList,
  onCoverageThresholdChange,
  onCreatePackage,
  onCriteriaChange,
  onNameChange,
  onSuppliersLimitChange,
  onUpdatePackage,
  packageName,
  suppliersLimit,
}: ProcurementPackageSidebarProps) {
  const { t } = useTranslation("procurement");
  const { t: tCommon } = useTranslation("common");

  const statusVariant: "secondary" | "warning" | "success" = isCreateMode
    ? "secondary"
    : hasUnsavedChanges
      ? "warning"
      : "success";

  const statusLabel = isCreateMode
    ? hasUnsavedChanges
      ? t("labels.draftLot")
      : t("labels.newLot")
    : hasUnsavedChanges
      ? t("labels.unsavedChanges")
      : t("labels.savedChanges");

  return (
    <div className="procurement-sidebar">
      <SectionHeader
        icon={<Package />}
        title={t("sections.packageInfo")}
        actions={expandButton}
      />
      <div className="procurement-sidebar-status">
        <Tag
          variant={statusVariant}
          size="sm"
          className="procurement-sidebar-tag"
        >
          {statusLabel}
        </Tag>
      </div>
      <div className="procurement-sidebar-body">
        <section className="procurement-sidebar-section">
          <div className="procurement-sidebar-section-header">
            <h3 className="procurement-sidebar-section-title">
              {t("sections.lotBasics")}
            </h3>
            <p className="procurement-sidebar-section-description">
              {t("labels.lotBasicsHelper")}
            </p>
          </div>
          <div className="procurement-sidebar-fields">
            <div className="procurement-sidebar-field flex flex-col gap-1">
              <Label>{t("fields.packageName")}</Label>
              <Input
                value={packageName}
                onChange={(event) => onNameChange(event.target.value)}
              />
              <div className="procurement-field-helper">
                {t("labels.packageNameHelper")}
              </div>
            </div>
            <div className="procurement-sidebar-field flex flex-col gap-1">
              <Label>{t("fields.criteria")}</Label>
              <TextArea
                value={criteria}
                placeholder={t("placeholders.criteria")}
                onChange={(event) => onCriteriaChange(event.target.value)}
                autoResize
                minHeight={96}
                maxHeight={320}
              />
              <div className="procurement-field-helper">
                {t("labels.criteriaHelper")}
              </div>
            </div>
          </div>
        </section>
        <section className="procurement-sidebar-section">
          <div className="procurement-sidebar-section-header">
            <h3 className="procurement-sidebar-section-title">
              {t("sections.selectionParameters")}
            </h3>
            <p className="procurement-sidebar-section-description">
              {t("labels.selectionParametersHelper")}
            </p>
          </div>
          <div className="procurement-sidebar-fields">
            <div className="procurement-sidebar-field flex flex-col gap-1">
              <Label>{t("fields.coverageThreshold")}</Label>
              <Input
                type="number"
                value={coverageThreshold}
                onChange={(event) =>
                  onCoverageThresholdChange(event.target.value)
                }
              />
              <div className="procurement-field-helper">
                {t("labels.coverageThresholdHelper")}
              </div>
            </div>
            <div className="procurement-sidebar-field flex flex-col gap-1">
              <Label>{t("fields.suppliersLimit")}</Label>
              <Input
                type="number"
                value={suppliersLimit}
                onChange={(event) => onSuppliersLimitChange(event.target.value)}
              />
              <div className="procurement-field-helper">
                {t("labels.suppliersLimitHelper")}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="procurement-sidebar-actions">
        {isCreateMode ? (
          <Button onClick={onCreatePackage} disabled={isSaveDisabled} fullWidth>
            {t("actions.createPackage")}
          </Button>
        ) : (
          <Button onClick={onUpdatePackage} disabled={isSaveDisabled} fullWidth>
            {t("actions.savePackage")}
          </Button>
        )}
        <Button variant="outline" onClick={onBackToList} fullWidth>
          {tCommon("actions.cancel")}
        </Button>
      </div>
    </div>
  );
}
