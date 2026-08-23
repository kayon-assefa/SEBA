import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { Product, SortDirection, SortField } from "../types/product";
import ProductRow from "./ProductRow";
import ProductDrawer from "./ProductDrawer";

type Props = {
  products: Product[];
  selectedIds: Set<string>;
  canDelete: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onQuickEdit: (product: Product, field: "price" | "stock", value: number) => void;
  onPrintLabel: (product: Product) => void;
  canApprove?: boolean;
  onApprove?: (product: Product) => void;
  onReject?: (product: Product) => void;
};

const NAME_COLUMN: { field: SortField; label: string } = {
  field: "name",
  label: "Name",
};

const NUMERIC_COLUMNS: Array<{ field: SortField; label: string }> = [
  { field: "price", label: "Price" },
  { field: "stock", label: "Stock" },
];

// BUG FIX: onEdit/onDelete are now actually passed down to each row
// instead of being discarded with `void onEdit; void onDelete;`.
export default function ProductTable({
  products,
  selectedIds,
  canDelete,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onToggleSelect,
  onToggleSelectAll,
  onQuickEdit,
  onPrintLabel,
  canApprove = false,
  onApprove,
  onReject,
}: Props) {
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);

  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  return (
    <>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              <th className="w-10 p-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-[#F25F5C] focus:ring-[#F25F5C]"
                  aria-label="Select all products"
                />
              </th>

              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Image
              </th>

              <th
                className="cursor-pointer select-none p-4 text-left text-sm font-semibold text-gray-600"
                onClick={() => onSort(NAME_COLUMN.field)}
              >
                <span className="inline-flex items-center gap-1">
                  {NAME_COLUMN.label}
                  {sortField === NAME_COLUMN.field &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={13} />
                    ) : (
                      <ArrowDown size={13} />
                    ))}
                </span>
              </th>

              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Category
              </th>

              {NUMERIC_COLUMNS.map((col) => (
                <th
                  key={col.field}
                  className="cursor-pointer select-none p-4 text-left text-sm font-semibold text-gray-600"
                  onClick={() => onSort(col.field)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortField === col.field &&
                      (sortDirection === "asc" ? (
                        <ArrowUp size={13} />
                      ) : (
                        <ArrowDown size={13} />
                      ))}
                  </span>
                </th>
              ))}

              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="p-4" />
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selected={selectedIds.has(product.id)}
                canDelete={canDelete}
                onOpen={() => setDrawerProduct(product)}
                onEdit={() => onEdit(product)}
                onDelete={() => onDelete(product)}
                onDuplicate={() => onDuplicate(product)}
                onToggleFavorite={() => onToggleFavorite(product)}
                onToggleSelect={() => onToggleSelect(product.id)}
                onQuickEdit={(field, value) => onQuickEdit(product, field, value)}
                onPrintLabel={() => onPrintLabel(product)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ProductDrawer
        product={drawerProduct}
        open={drawerProduct !== null}
        onClose={() => setDrawerProduct(null)}
        onEdit={() => {
          if (drawerProduct) onEdit(drawerProduct);
          setDrawerProduct(null);
        }}
        canApprove={canApprove}
        onApprove={() => {
          if (drawerProduct) onApprove?.(drawerProduct);
          setDrawerProduct(null);
        }}
        onReject={() => {
          if (drawerProduct) onReject?.(drawerProduct);
          setDrawerProduct(null);
        }}
      />
    </>
  );
}
