import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Loader,
} from "@enikitina311/ui";
import {
  parseProcurementNmcTableJson,
  type ProcurementNmcResult,
} from "@/services/api";

interface ProcurementNmcTabProps {
  handleGenerateNmc: () => void | Promise<void>;
  isGeneratingNmc: boolean;
  nmcResult: ProcurementNmcResult | null;
}

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "";
  }

  return numberFormatter.format(value);
};

export function ProcurementNmcTab({
  handleGenerateNmc,
  isGeneratingNmc,
  nmcResult,
}: ProcurementNmcTabProps) {
  const { t } = useTranslation("procurement");

  const parsedNmcTable = useMemo(
    () => parseProcurementNmcTableJson(nmcResult?.nmcTableJson),
    [nmcResult?.nmcTableJson],
  );

  const hasStructuredTable =
    !!parsedNmcTable &&
    parsedNmcTable.suppliers.length > 0 &&
    parsedNmcTable.rows.length > 0;

  return (
    <div className="procurement-section">
      <Button onClick={handleGenerateNmc} disabled={isGeneratingNmc}>
        {isGeneratingNmc
          ? t("actions.generatingNmc")
          : t("actions.generateNmc")}
      </Button>

      {isGeneratingNmc && (
        <Loader size="default" caption={t("actions.generatingNmc")} />
      )}

      {hasStructuredTable ? (
        <Card className="procurement-card">
          <CardHeader>
            <CardTitle>{t("tabs.nmc")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="procurement-nmc-scroll">
              <table className="procurement-nmc-table">
                <colgroup>
                  <col className="procurement-nmc-col procurement-nmc-col--no" />
                  <col className="procurement-nmc-col procurement-nmc-col--name" />
                  <col className="procurement-nmc-col procurement-nmc-col--specs" />
                  <col className="procurement-nmc-col procurement-nmc-col--qty" />
                  <col className="procurement-nmc-col procurement-nmc-col--unit" />
                  {parsedNmcTable.suppliers.flatMap((supplier) => [
                    <col
                      key={`${supplier.supplierName}-qty-col`}
                      className="procurement-nmc-col procurement-nmc-col--offer-qty"
                    />,
                    <col
                      key={`${supplier.supplierName}-price-col`}
                      className="procurement-nmc-col procurement-nmc-col--offer-price"
                    />,
                    <col
                      key={`${supplier.supplierName}-vat-col`}
                      className="procurement-nmc-col procurement-nmc-col--offer-vat"
                    />,
                    <col
                      key={`${supplier.supplierName}-total-col`}
                      className="procurement-nmc-col procurement-nmc-col--offer-total"
                    />,
                  ])}
                  <col className="procurement-nmc-col procurement-nmc-col--summary" />
                  <col className="procurement-nmc-col procurement-nmc-col--summary" />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      className="procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-sticky-col procurement-nmc-sticky-col-1"
                      rowSpan={2}
                    >
                      {t("table.positionNo")}
                    </th>
                    <th
                      className="procurement-nmc-cell procurement-nmc-cell--header"
                      rowSpan={2}
                    >
                      {t("fields.itemName")}
                    </th>
                    <th
                      className="procurement-nmc-cell procurement-nmc-cell--header"
                      rowSpan={2}
                    >
                      {t("table.specs")}
                    </th>
                    <th
                      className="procurement-nmc-cell procurement-nmc-cell--header"
                      rowSpan={2}
                    >
                      {t("table.qty")}
                    </th>
                    <th
                      className="procurement-nmc-cell procurement-nmc-cell--header"
                      rowSpan={2}
                    >
                      {t("table.unit")}
                    </th>
                    {parsedNmcTable.suppliers.map((supplier) => (
                      <th
                        key={supplier.supplierName}
                        className="procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--supplier-group"
                        colSpan={4}
                      >
                        {supplier.supplierName}
                      </th>
                    ))}
                    <th
                      className="procurement-nmc-cell procurement-nmc-cell--header"
                      rowSpan={2}
                    >
                      {t("labels.averageUnitPriceWithVat")}
                    </th>
                    <th
                      className="procurement-nmc-cell procurement-nmc-cell--header"
                      rowSpan={2}
                    >
                      {t("labels.nmcTotalWithVat")}
                    </th>
                  </tr>
                  <tr>
                    {parsedNmcTable.suppliers.flatMap((supplier) => [
                      <th
                        key={`${supplier.supplierName}-qty`}
                        className="procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--subheader"
                      >
                        {t("table.qty")}
                      </th>,
                      <th
                        key={`${supplier.supplierName}-price`}
                        className="procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--subheader"
                      >
                        {t("labels.priceWithVat")}
                      </th>,
                      <th
                        key={`${supplier.supplierName}-vat`}
                        className="procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--subheader"
                      >
                        {t("labels.vatPercent")}
                      </th>,
                      <th
                        key={`${supplier.supplierName}-total`}
                        className="procurement-nmc-cell procurement-nmc-cell--header procurement-nmc-cell--subheader"
                      >
                        {t("labels.totalWithVat")}
                      </th>,
                    ])}
                  </tr>
                </thead>
                <tbody>
                  {parsedNmcTable.rows.map((row) => {
                    const offersBySupplier = new Map(
                      row.offers.map((offer) => [offer.supplierName, offer]),
                    );

                    return (
                      <tr key={`${row.positionNo}-${row.itemName}`}>
                        <td className="procurement-nmc-cell procurement-nmc-sticky-col procurement-nmc-sticky-col-1 procurement-nmc-cell--center">
                          {row.positionNo}
                        </td>
                        <td className="procurement-nmc-cell procurement-nmc-cell--item-name">
                          {row.itemName}
                        </td>
                        <td className="procurement-nmc-cell procurement-nmc-cell--specs">
                          {row.specs || ""}
                        </td>
                        <td className="procurement-nmc-cell procurement-nmc-cell--center">
                          {row.requestedQty ?? ""}
                        </td>
                        <td className="procurement-nmc-cell">
                          {row.requestedUnit || ""}
                        </td>
                        {parsedNmcTable.suppliers.flatMap((supplier) => {
                          const offer = offersBySupplier.get(
                            supplier.supplierName,
                          );

                          return [
                            <td
                              key={`${row.positionNo}-${supplier.supplierName}-qty`}
                              className="procurement-nmc-cell procurement-nmc-cell--center"
                            >
                              {offer?.qty ?? ""}
                            </td>,
                            <td
                              key={`${row.positionNo}-${supplier.supplierName}-price`}
                              className="procurement-nmc-cell procurement-nmc-cell--numeric"
                            >
                              {formatNumber(offer?.priceWithVat)}
                            </td>,
                            <td
                              key={`${row.positionNo}-${supplier.supplierName}-vat`}
                              className="procurement-nmc-cell procurement-nmc-cell--center"
                            >
                              {formatNumber(offer?.vatPercent)}
                            </td>,
                            <td
                              key={`${row.positionNo}-${supplier.supplierName}-total`}
                              className="procurement-nmc-cell procurement-nmc-cell--numeric"
                            >
                              {formatNumber(offer?.totalWithVat)}
                            </td>,
                          ];
                        })}
                        <td className="procurement-nmc-cell procurement-nmc-cell--numeric procurement-nmc-cell--summary">
                          {formatNumber(row.averageUnitPriceWithVat)}
                        </td>
                        <td className="procurement-nmc-cell procurement-nmc-cell--numeric procurement-nmc-cell--summary">
                          {formatNumber(row.nmcTotalWithVat)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : nmcResult?.nmcTableText ? (
        <Card className="procurement-card">
          <CardHeader>
            <CardTitle>{t("labels.nmcDebugTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="procurement-pre">{nmcResult.nmcTableText}</pre>
          </CardContent>
        </Card>
      ) : (
        !isGeneratingNmc && (
          <EmptyState
            title={t("empty.noNmcTitle")}
            description={t("empty.noNmcDescription")}
          />
        )
      )}
    </div>
  );
}
