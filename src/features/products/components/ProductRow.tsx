import { useState } from "react";
import { Pencil, Trash2, Star, Copy, Printer } from "lucide-react";
import type { Product } from "../types/product";
import { formatCurrency } from "../utils/currency";

type Props = {
  product: Product;
  selected: boolean;
  canDelete: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onToggleSelect: () => void;
  onQuickEdit: (field: "price" | "stock", value: number) => void;
  onPrintLabel: () => void;
};

// BUG FIX: this component previously rendered a static row with no way
// to edit or delete - onEdit/onDelete were accepted by ProductTable but
// never actually wired to anything. Both actions now work, plus the
// checkbox for bulk actions (#6), an inline quick-edit for price/stock
// (#19), a low-stock badge (#10), and a favorite star (#54).
export default function ProductRow({
  product,
  selected,
  canDelete,
  onOpen,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onToggleSelect,
  onQuickEdit,
  onPrintLabel,
}: Props) {
  const [editingField, setEditingField] = useState<"price" | "stock" | null>(
    null
  );
  const [draftValue, setDraftValue] = useState("");

  const isLowStock = product.stock <= (product.low_stock_threshold ?? 5);

  function startQuickEdit(field: "price" | "stock", event: React.MouseEvent) {
    event.stopPropagation();
    setEditingField(field);
    setDraftValue(String(product[field]));
  }

  function commitQuickEdit() {
    if (!editingField) return;

    const value = Number(draftValue);
    if (!Number.isNaN(value) && value >= 0) {
      onQuickEdit(editingField, value);
    }

    setEditingField(null);
  }

  return (
    <tr
      className={`group cursor-pointer border-b transition hover:bg-gray-50 ${
        selected ? "bg-[#F25F5C]/5" : ""
      }`}
    >
      <td className="w-10 p-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-gray-300 text-[#F25F5C] focus:ring-[#F25F5C]"
          aria-label={`Select ${product.name}`}
        />
      </td>

      <td className="p-4" onClick={onOpen}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
            📦
          </div>
        )}
      </td>

      <td className="p-4" onClick={onOpen}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#2B2B2B]">{product.name}</span>
          {product.approval_status === "pending" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Pending approval
            </span>
          )}
        </div>
        {product.sku && (
          <span className="text-xs text-gray-400">SKU: {product.sku}</span>
        )}
      </td>

      <td className="p-4 text-sm text-gray-600" onClick={onOpen}>
        {product.category ?? "—"}
      </td>

      <td className="p-4 text-sm" onClick={(e) => startQuickEdit("price", e)}>
        {editingField === "price" ? (
          <input
            autoFocus
            type="number"
            className="w-24 rounded-lg border border-[#F25F5C] px-2 py-1 text-sm outline-none"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={commitQuickEdit}
            onKeyDown={(e) => e.key === "Enter" && commitQuickEdit()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          formatCurrency(product.price, product.currency)
        )}
      </td>

      <td className="p-4 text-sm" onClick={(e) => startQuickEdit("stock", e)}>
        {editingField === "stock" ? (
          <input
            autoFocus
            type="number"
            className="w-20 rounded-lg border border-[#F25F5C] px-2 py-1 text-sm outline-none"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={commitQuickEdit}
            onKeyDown={(e) => e.key === "Enter" && commitQuickEdit()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex items-center gap-1.5">
            {product.stock}
            {isLowStock && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Low stock
              </span>
            )}
          </span>
        )}
      </td>

      <td className="p-4" onClick={onOpen}>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            product.status === "Active"
              ? "bg-green-100 text-green-700"
              : product.status === "Draft"
              ? "bg-gray-100 text-gray-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {product.status}
        </span>
      </td>

      <td className="p-4">
        <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-500"
            aria-label="Toggle favorite"
          >
            <Star
              size={16}
              fill={product.is_favorite ? "currentColor" : "none"}
              className={product.is_favorite ? "text-amber-500" : ""}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrintLabel();
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Print label"
          >
            <Printer size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Duplicate product"
          >
            <Copy size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#F25F5C]"
            aria-label="Edit product"
          >
            <Pencil size={16} />
          </button>

          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete product"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
