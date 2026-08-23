import { Star } from "lucide-react";
import type { Product } from "../types/product";
import { formatCurrency } from "../utils/currency";

type Props = {
  products: Product[];
  onOpen: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
};

// Feature #1 - grid/card view toggle, #17 - mobile card layout reuses this
export default function ProductCardGrid({ products, onOpen, onToggleFavorite }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const isLowStock = product.stock <= (product.low_stock_threshold ?? 5);

        return (
          <button
            key={product.id}
            onClick={() => onOpen(product)}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition hover:shadow-md"
          >
            <div className="relative h-36 w-full bg-gray-100">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">📦</div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product);
                }}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm"
                aria-label="Toggle favorite"
              >
                <Star size={14} fill={product.is_favorite ? "currentColor" : "none"} className={product.is_favorite ? "text-amber-500" : "text-gray-400"} />
              </button>

              {isLowStock && (
                <span className="absolute left-2 top-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Low stock
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1 p-3">
              <p className="font-medium text-[#2B2B2B]">{product.name}</p>
              <p className="text-xs text-gray-400">{product.category ?? "Uncategorized"}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="font-semibold text-[#2B2B2B]">{formatCurrency(product.price, product.currency)}</span>
                <span className="text-xs text-gray-500">{product.stock} {product.unit}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
