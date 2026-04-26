import { Fragment, type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ConfirmationDialog,
  EmptyState,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TextArea,
} from "@enikitina311/ui";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ProcurementItem } from "@/services/api";

interface ProcurementItemsTabProps {
  handleAddItemIfReady: () => void | Promise<void>;
  handleDeleteItem: (itemId: string) => void | Promise<void>;
  handleUpdateItem: (
    itemId: string,
    values: {
      name: string;
      qty: string;
      specs: string;
      unit: string;
    },
  ) => void | Promise<void>;
  isCreateMode: boolean;
  itemAddVersion: number;
  items: ProcurementItem[];
  newItemName: string;
  newItemQty: string;
  newItemSpecs: string;
  newItemUnit: string;
  onNewItemNameChange: (value: string) => void;
  onNewItemQtyChange: (value: string) => void;
  onNewItemSpecsChange: (value: string) => void;
  onNewItemUnitChange: (value: string) => void;
}

function getRequirementsPreview(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function shouldShowRequirementsExpand(value: string | null | undefined) {
  const preview = getRequirementsPreview(value);
  if (!preview) return false;
  return preview.length > 120 || (value?.includes("\n") ?? false);
}

export function ProcurementItemsTab({
  handleAddItemIfReady,
  handleDeleteItem,
  handleUpdateItem,
  isCreateMode,
  itemAddVersion,
  items,
  newItemName,
  newItemQty,
  newItemSpecs,
  newItemUnit,
  onNewItemNameChange,
  onNewItemQtyChange,
  onNewItemSpecsChange,
  onNewItemUnitChange,
}: ProcurementItemsTabProps) {
  const { t } = useTranslation("procurement");
  const { t: tCommon } = useTranslation("common");
  const addNameInputRef = useRef<HTMLInputElement>(null);
  const editNameInputRef = useRef<HTMLInputElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemSpecs, setEditItemSpecs] = useState("");
  const [editItemQty, setEditItemQty] = useState("");
  const [editItemUnit, setEditItemUnit] = useState("");
  const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);
  const [deleteConfirmItem, setDeleteConfirmItem] =
    useState<ProcurementItem | null>(null);

  useEffect(() => {
    if (itemAddVersion > 0 && !isCreateMode) {
      setIsAddModalOpen(false);
    }
  }, [isCreateMode, itemAddVersion]);

  useEffect(() => {
    if (isAddModalOpen) {
      addNameInputRef.current?.focus();
    }
  }, [isAddModalOpen]);

  useEffect(() => {
    if (editingItemId) {
      editNameInputRef.current?.focus();
    }
  }, [editingItemId]);

  useEffect(() => {
    const currentItemIds = new Set(items.map((item) => item.id));
    setExpandedItemIds((previous) =>
      previous.filter((itemId) => currentItemIds.has(itemId)),
    );

    if (editingItemId && !currentItemIds.has(editingItemId)) {
      setEditingItemId(null);
      setEditItemName("");
      setEditItemSpecs("");
      setEditItemQty("");
      setEditItemUnit("");
    }
  }, [editingItemId, items]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleAddItemIfReady();
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingItemId || !editItemName.trim()) return;

    await handleUpdateItem(editingItemId, {
      name: editItemName,
      qty: editItemQty,
      specs: editItemSpecs,
      unit: editItemUnit,
    });

    setEditingItemId(null);
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItemIds((previous) => {
      const isExpanded = previous.includes(itemId);
      return isExpanded
        ? previous.filter((currentId) => currentId !== itemId)
        : [...previous, itemId];
    });
  };

  const openEditModal = (item: ProcurementItem) => {
    setEditingItemId(item.id);
    setEditItemName(item.name || "");
    setEditItemSpecs(item.specs || "");
    setEditItemQty(
      item.qty !== null && item.qty !== undefined ? String(item.qty) : "",
    );
    setEditItemUnit(item.unit || "");
  };

  return (
    <div className="procurement-section procurement-items-tab">
      <div className="procurement-items-toolbar">
        <Button
          type="button"
          startIcon={<Plus />}
          onClick={() => setIsAddModalOpen(true)}
          disabled={isCreateMode}
        >
          {t("sections.addItem")}
        </Button>
      </div>

      <Modal
        open={isAddModalOpen}
        onOpenChange={(o) => !o && setIsAddModalOpen(false)}
      >
        <ModalContent size="default">
          <ModalHeader>
            <ModalTitle>{t("sections.addItem")}</ModalTitle>
          </ModalHeader>
        <form
          id="procurement-add-item-form"
          className="procurement-items-modal-form"
          onSubmit={handleSubmit}
        >
          <div className="procurement-items-create-field procurement-items-create-field--name">
            <div className="procurement-items-create-label">
              {t("fields.itemName")}
            </div>
            <Input
              ref={addNameInputRef}
              placeholder={t("fields.itemName")}
              value={newItemName}
              onChange={(event) => onNewItemNameChange(event.target.value)}
              disabled={isCreateMode}
            />
          </div>

          <div className="procurement-items-create-field procurement-items-create-field--specs">
            <div className="procurement-items-create-label">
              {t("fields.itemSpecs")}
            </div>
            <TextArea
              placeholder={t("fields.itemSpecs")}
              value={newItemSpecs}
              onChange={(event) => onNewItemSpecsChange(event.target.value)}
              disabled={isCreateMode}
              autoResize
              rows={1}
              minHeight={44}
              maxHeight={220}
            />
            <div className="procurement-items-create-helper">
              {t("labels.requirementsHelper")}
            </div>
          </div>

          <div className="procurement-items-modal-meta">
            <div className="procurement-items-create-field procurement-items-create-field--qty">
              <div className="procurement-items-create-label">
                {t("fields.itemQty")}
              </div>
              <Input
                placeholder={t("fields.itemQty")}
                type="number"
                value={newItemQty}
                onChange={(event) => onNewItemQtyChange(event.target.value)}
                disabled={isCreateMode}
              />
            </div>

            <div className="procurement-items-create-field procurement-items-create-field--unit">
              <div className="procurement-items-create-label">
                {t("fields.itemUnit")}
              </div>
              <Input
                placeholder={t("fields.itemUnit")}
                value={newItemUnit}
                onChange={(event) => onNewItemUnitChange(event.target.value)}
                disabled={isCreateMode}
              />
            </div>
          </div>
        </form>
        <ModalFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setIsAddModalOpen(false)}
          >
            {tCommon("actions.cancel")}
          </Button>
          <Button
            type="submit"
            form="procurement-add-item-form"
            startIcon={<Plus />}
            disabled={isCreateMode || !newItemName.trim()}
          >
            {tCommon("actions.add")}
          </Button>
        </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        open={editingItemId !== null}
        onOpenChange={(o) => !o && setEditingItemId(null)}
      >
        <ModalContent size="default">
          <ModalHeader>
            <ModalTitle>{tCommon("actions.edit")}</ModalTitle>
          </ModalHeader>
        <form
          id="procurement-edit-item-form"
          className="procurement-items-modal-form"
          onSubmit={handleEditSubmit}
        >
          <div className="procurement-items-create-field procurement-items-create-field--name">
            <div className="procurement-items-create-label">
              {t("fields.itemName")}
            </div>
            <Input
              ref={editNameInputRef}
              placeholder={t("fields.itemName")}
              value={editItemName}
              onChange={(event) => setEditItemName(event.target.value)}
            />
          </div>

          <div className="procurement-items-create-field procurement-items-create-field--specs">
            <div className="procurement-items-create-label">
              {t("fields.itemSpecs")}
            </div>
            <TextArea
              placeholder={t("fields.itemSpecs")}
              value={editItemSpecs}
              onChange={(event) => setEditItemSpecs(event.target.value)}
              autoResize
              rows={1}
              minHeight={44}
              maxHeight={220}
            />
            <div className="procurement-items-create-helper">
              {t("labels.requirementsHelper")}
            </div>
          </div>

          <div className="procurement-items-modal-meta">
            <div className="procurement-items-create-field procurement-items-create-field--qty">
              <div className="procurement-items-create-label">
                {t("fields.itemQty")}
              </div>
              <Input
                placeholder={t("fields.itemQty")}
                type="number"
                value={editItemQty}
                onChange={(event) => setEditItemQty(event.target.value)}
              />
            </div>

            <div className="procurement-items-create-field procurement-items-create-field--unit">
              <div className="procurement-items-create-label">
                {t("fields.itemUnit")}
              </div>
              <Input
                placeholder={t("fields.itemUnit")}
                value={editItemUnit}
                onChange={(event) => setEditItemUnit(event.target.value)}
              />
            </div>
          </div>
        </form>
        <ModalFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setEditingItemId(null)}
          >
            {tCommon("actions.cancel")}
          </Button>
          <Button
            type="submit"
            form="procurement-edit-item-form"
            disabled={!editItemName.trim()}
          >
            {tCommon("actions.save")}
          </Button>
        </ModalFooter>
        </ModalContent>
      </Modal>

      {items.length === 0 ? (
        <EmptyState
          title={t("empty.noItemsTitle")}
          description={t("empty.noItemsDescription")}
        />
      ) : (
        <div className="procurement-table-wrapper procurement-items-table-wrapper">
          <Table className="procurement-items-table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell width="64px">#</TableHeaderCell>
                <TableHeaderCell width="22%">{t("table.name")}</TableHeaderCell>
                <TableHeaderCell>{t("table.specs")}</TableHeaderCell>
                <TableHeaderCell width="120px">
                  {t("table.qty")}
                </TableHeaderCell>
                <TableHeaderCell width="140px">
                  {t("table.unit")}
                </TableHeaderCell>
                <TableHeaderCell width="132px" align="right">
                  {t("table.actions")}
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const isExpanded = expandedItemIds.includes(item.id);
                const requirementsPreview = getRequirementsPreview(item.specs);
                const showExpandRequirements = shouldShowRequirementsExpand(
                  item.specs,
                );

                return (
                  <Fragment key={item.id}>
                    <TableRow className="procurement-item-row">
                      <TableCell
                        className="procurement-item-index"
                        width="64px"
                      >
                        {index + 1}
                      </TableCell>

                      <TableCell
                        className="procurement-item-name-cell"
                        width="22%"
                      >
                        {item.name || "-"}
                      </TableCell>

                      <TableCell className="procurement-item-specs-cell">
                        <div className="procurement-item-specs-preview">
                          {requirementsPreview || (
                            <span className="procurement-item-specs-empty">
                              {t("labels.requirementsEmpty")}
                            </span>
                          )}
                        </div>
                        {!isExpanded && showExpandRequirements && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(item.id)}
                          >
                            ... {t("actions.expandRequirements")}
                          </Button>
                        )}
                      </TableCell>

                      <TableCell
                        className="procurement-item-qty-cell"
                        width="120px"
                      >
                        {item.qty !== null && item.qty !== undefined
                          ? String(item.qty)
                          : "-"}
                      </TableCell>

                      <TableCell
                        className="procurement-item-unit-cell"
                        width="140px"
                      >
                        {item.unit || "-"}
                      </TableCell>

                      <TableCell
                        className="procurement-item-actions-cell"
                        width="132px"
                        align="right"
                      >
                        <div className="procurement-item-actions-group">
                          <Button
                            variant="outline"
                            iconOnly
                            type="button"
                            onClick={() => openEditModal(item)}
                            title={tCommon("actions.edit")}
                          >
                            <Pencil className="icon-sm" />
                          </Button>
                          <Button
                            variant="outline"
                            iconOnly
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            title={t("actions.delete")}
                          >
                            <Trash2 className="icon-sm" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="procurement-item-details-row">
                        <TableCell
                          colSpan={6}
                          className="procurement-item-details-cell"
                        >
                          <div className="procurement-item-details">
                            <div className="procurement-item-details-header">
                              <div>
                                <div className="procurement-item-details-title">
                                  {t("table.specs")}
                                </div>
                                <div className="procurement-item-details-description">
                                  {t("labels.requirementsHelper")}
                                </div>
                              </div>

                              <div className="procurement-item-details-actions">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  onClick={() => toggleExpanded(item.id)}
                                >
                                  {t("actions.collapseRequirements")}
                                </Button>
                              </div>
                            </div>

                            <div className="procurement-item-details-text">
                              {item.specs?.trim() ||
                                t("labels.requirementsEmpty")}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmationDialog
        open={deleteConfirmItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmItem(null);
          }
        }}
        onConfirm={async () => {
          if (deleteConfirmItem) {
            await handleDeleteItem(deleteConfirmItem.id);
          }
          setDeleteConfirmItem(null);
        }}
        title={t("dialogs.deleteItemTitle")}
        description={t("dialogs.deleteItemDescription", {
          name: deleteConfirmItem?.name ?? "",
        })}
        variant="danger"
        confirmText={tCommon("delete")}
      />
    </div>
  );
}
