import { useEffect, useState } from "react";
import { X, Eye, Share2 } from "lucide-react";
import type { Product } from "../types/product";
import type { StockHistoryEntry, ActivityLogEntry } from "../types/catalog";
import { formatCurrency } from "../utils/currency";
import { stockHistoryService } from "../services/stockHistory.service";
import { activityLogService } from "../services/activityLog.service";
import { productService } from "../services/product.service";

type Props = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  canApprove?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
};

type Tab = "overview" | "history" | "analytics";

// Feature #20 - tabs in the drawer (Overview / Inventory History / Analytics)
// Also records a view for the lightweight analytics feature (#53) and
// fixes the missing alt text / broken-image fallback (bug fix).
export default function ProductDrawer({
  product,
  open,
  onClose,
  onEdit,
  canApprove = false,
  onApprove,
  onReject,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [history, setHistory] = useState<StockHistoryEntry[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    if (open && product) {
      setTab("overview");
      productService.recordView(product.id);
    }
  }, [open, product?.id]);

  useEffect(() => {
    if (!product) return;

    if (tab === "history") {
      setLoadingTab(true);
      stockHistoryService
        .getForProduct(product.id)
        .then(setHistory)
        .finally(() => setLoadingTab(false));
    }

    if (tab === "analytics") {
      setLoadingTab(true);
      activityLogService
        .getForProduct(product.id)
        .then(setActivity)
        .finally(() => setLoadingTab(false));
    }
  }, [tab, product?.id]);

  if (!open || !product) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40" />

      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-bold text-[#2B2B2B]">Product</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg bg-[#F25F5C]/10 px-3 py-1.5 text-sm font-medium text-[#F25F5C] hover:bg-[#F25F5C]/20"
            >
              Edit
            </button>
            <button onClick={onClose} aria-label="Close">
              <X />
            </button>
          </div>
        </div>

        {canApprove && product.approval_status === "pending" && (
          <div className="flex items-center justify-between gap-3 border-b bg-amber-50 px-5 py-3">
            <span className="text-sm font-medium text-amber-800">
              Awaiting your approval
            </span>
            <div className="flex gap-2">
              <button
                onClick={onReject}
                className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                Approve
              </button>
            </div>
          </div>
        )}

        <div className="flex border-b px-5">
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "history", label: "Inventory History" },
              { id: "analytics", label: "Analytics" },
            ] as Array<{ id: Tab; label: string }>
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 py-3 text-sm font-medium transition ${
                tab === t.id
                  ? "border-[#F25F5C] text-[#F25F5C]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-5 p-5">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-40 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gray-100 text-4xl text-gray-300">
                📦
              </div>
            )}

            <Field label="Name" value={product.name} />
            <Field label="Category" value={product.category ?? "—"} />
            <Field label="SKU" value={product.sku ?? "—"} />
            <Field label="Barcode" value={product.barcode ?? "—"} />
            <Field
              label="Price"
              value={formatCurrency(product.price, product.currency)}
            />
            {product.cost_price != null && (
              <Field
                label="Cost price"
                value={formatCurrency(product.cost_price, product.currency)}
              />
            )}
            <Field label="Stock" value={`${product.stock} ${product.unit}`} />
            <Field label="Description" value={product.description ?? "—"} />

            <div className="flex items-center gap-2 pt-2 text-sm text-gray-500">
              <Eye size={15} /> {product.view_count ?? 0} views
              {product.is_public && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <Share2 size={12} /> Public
                </span>
              )}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="p-5">
            {loadingTab ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400">No stock changes recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {history.map((entry) => (
                  <li key={entry.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex justify-between font-medium text-[#2B2B2B]">
                      <span>
                        {entry.change > 0 ? "+" : ""}
                        {entry.change} ({entry.previous_stock} → {entry.new_stock})
                      </span>
                      <span className="text-xs font-normal text-gray-400">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="mt-1 text-gray-500">{entry.reason}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div className="p-5">
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4">
                <p className="text-xs text-gray-500">Views</p>
                <p className="text-2xl font-bold text-[#2B2B2B]">
                  {product.view_count ?? 0}
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-xs text-gray-500">Current stock</p>
                <p className="text-2xl font-bold text-[#2B2B2B]">
                  {product.stock}
                </p>
              </div>
            </div>

            <p className="mb-2 text-sm font-semibold text-gray-600">
              Activity log
            </p>

            {loadingTab ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {activity.map((entry) => (
                  <li key={entry.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                    <span className="font-medium capitalize text-[#2B2B2B]">
                      {entry.action}
                    </span>{" "}
                    <span className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="text-[#2B2B2B]">{value}</p>
    </div>
  );
}
