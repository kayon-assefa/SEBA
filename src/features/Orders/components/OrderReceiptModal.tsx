import { useRef } from "react";
import { X, Printer, Send, MapPin, Clock } from "lucide-react";

import type { Order } from "../types/order";
import {
  buildReceiptUrl,
  calculateOrderTotals,
  formatCurrency,
  formatOrderNumber,
} from "../lib/receipt";

import QRCodeBadge from "./QRCodeBadge";
import OrderStatus from "./OrderStatus";

type Props = {
  order: Order | null;
  open: boolean;
  businessName: string;
  businessSlug: string;
  onClose: () => void;
};

export default function OrderReceiptModal({
  order,
  open,
  businessName,
  businessSlug,
  onClose,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open || !order) {
    return null;
  }

  const totals = calculateOrderTotals(order);
  const receiptUrl = buildReceiptUrl(businessSlug, order.id);
  const orderNumber = formatOrderNumber(order);
  const date = new Date(order.created_at);

  function handlePrint() {
    const printContents = printRef.current?.innerHTML;

    if (!printContents) return;

    const printWindow = window.open(
      "",
      "_blank",
      "width=420,height=720"
    );

    if (!printWindow) {
      // Popup blocked — fall back to printing the whole page
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${orderNumber}</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
              background: #FDF8F1;
              color: #1c1917;
              padding: 24px;
              margin: 0;
            }
            .receipt { max-width: 380px; margin: 0 auto; }
            .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
            .muted { color: #78716c; }
            .divider { border-top: 1px dashed #d6d3d1; margin: 14px 0; }
            .total-row { font-size: 18px; font-weight: 700; }
            h1 { font-size: 20px; margin: 0 0 4px; }
            h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #a8a29e; margin: 18px 0 6px; }
            .center { text-align: center; }
            @media print {
              body { background: white; padding: 0; }
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  function handleTelegramSend() {
    // Telegram delivery isn't wired up yet — this is a placeholder
    // until the bot integration is set up. See README "Telegram" section.
    alert(
      "Telegram sending will be set up later — this button is ready to wire up once the bot is connected."
    );
  }

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-[#FDF8F1] shadow-2xl ring-1 ring-black/5">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-gray-900"
          aria-label="Close receipt"
        >
          <X size={18} />
        </button>

        <div className="overflow-y-auto px-6 pb-6 pt-8">
          <div ref={printRef} className="receipt">
            {/* Header */}
            <div className="center mb-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-lg font-bold text-white">
                {businessName.slice(0, 1).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {businessName}
              </h1>
              <p className="muted mt-1 text-sm text-gray-500">
                Order Receipt
              </p>
            </div>

            {/* Status */}
            <div className="mb-5 flex items-center justify-center">
              <OrderStatus status={order.status} />
            </div>

            {/* QR */}
            <div className="mb-5 flex flex-col items-center gap-3">
              <QRCodeBadge
                value={receiptUrl}
                size={180}
                emblemText={businessName}
              />
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Order ID
                </p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  #{orderNumber}
                </p>
              </div>
            </div>

            <div className="divider border-t border-dashed border-stone-300" />

            {/* Customer */}
            <h2 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Customer
            </h2>
            <div className="row flex justify-between py-1 text-sm">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-gray-900">
                {order.customer_name}
              </span>
            </div>
            <div className="row flex justify-between py-1 text-sm">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium text-gray-900">
                {order.customer_phone}
              </span>
            </div>

            {order.delivery_type === "delivery" &&
              order.delivery_address && (
                <div className="mt-1 flex items-start gap-2 text-sm text-gray-600">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{order.delivery_address}</span>
                </div>
              )}

            {order.estimated_ready_at && (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} />
                <span>
                  Ready by{" "}
                  {new Date(
                    order.estimated_ready_at
                  ).toLocaleString()}
                </span>
              </div>
            )}

            <div className="divider my-4 border-t border-dashed border-stone-300" />

            {/* Items */}
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Items
            </h2>

            <div className="space-y-2">
              {(order.order_items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} ×{" "}
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(
                      item.price * item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="divider my-4 border-t border-dashed border-stone-300" />

            {/* Totals */}
            <div className="space-y-1.5">
              <div className="row flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>

              {totals.discount > 0 && (
                <div className="row flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-gray-900">
                    -{formatCurrency(totals.discount)}
                  </span>
                </div>
              )}

              {totals.tax > 0 && (
                <div className="row flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">
                    {formatCurrency(totals.tax)}
                  </span>
                </div>
              )}

              <div className="total-row flex justify-between pt-2 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>

              {totals.amountPaid > 0 && (
                <>
                  <div className="row flex justify-between text-sm">
                    <span className="text-gray-500">Paid</span>
                    <span className="text-gray-900">
                      {formatCurrency(totals.amountPaid)}
                    </span>
                  </div>
                  <div className="row flex justify-between text-sm font-semibold">
                    <span className="text-gray-500">
                      Balance due
                    </span>
                    <span className="text-orange-700">
                      {formatCurrency(totals.balanceDue)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {order.notes && (
              <>
                <div className="divider my-4 border-t border-dashed border-stone-300" />
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Notes
                </h2>
                <p className="text-sm text-gray-600">
                  {order.notes}
                </p>
              </>
            )}

            <div className="center mt-6 text-center">
              <p className="muted text-xs text-gray-400">
                {date.toLocaleString()}
              </p>
              <p className="muted mt-1 text-[11px] text-gray-400">
                seba.com/{businessSlug}/order/{order.id}
              </p>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex gap-2 border-t border-stone-200 bg-white/70 p-4 backdrop-blur">
          <button
            type="button"
            onClick={handleTelegramSend}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1b8ec2]"
          >
            <Send size={16} />
            Send on Telegram
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
