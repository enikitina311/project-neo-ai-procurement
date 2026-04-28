import type { ProcurementItem } from "../../services/api";
interface ProcurementItemsTabProps {
    handleAddItemIfReady: () => void | Promise<void>;
    handleDeleteItem: (itemId: string) => void | Promise<void>;
    handleUpdateItem: (itemId: string, values: {
        name: string;
        qty: string;
        specs: string;
        unit: string;
    }) => void | Promise<void>;
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
export declare function ProcurementItemsTab({ handleAddItemIfReady, handleDeleteItem, handleUpdateItem, isCreateMode, itemAddVersion, items, newItemName, newItemQty, newItemSpecs, newItemUnit, onNewItemNameChange, onNewItemQtyChange, onNewItemSpecsChange, onNewItemUnitChange, }: ProcurementItemsTabProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProcurementItemsTab.d.ts.map