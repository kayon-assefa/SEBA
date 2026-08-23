/**
 * Feature #49 - printable labels / QR codes.
 * Uses the `qrcode` package (see README for install command) to render a
 * data-URL PNG we can drop straight into an <img> for printing.
 */
export async function generateQrDataUrl(value: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;

  return QRCode.toDataURL(value, {
    margin: 1,
    width: 240,
  });
}

export function openPrintWindow(html: string) {
  const printWindow = window.open("", "_blank", "width=400,height=600");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print label</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 16px; }
          img { width: 160px; height: 160px; }
          h3 { margin: 8px 0 0; }
          p { margin: 2px 0; color: #555; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
