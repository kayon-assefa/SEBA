import React, { useEffect } from "react";
import { Icon } from "./Icons";

export function Modal({
  title, onClose, children, footer, width = 480,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ss-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ss-modal" style={{ maxWidth: width }}>
        <div className="ss-modal-header">
          <h3 className="ss-h2">{title}</h3>
          <button className="ss-btn ss-btn-ghost ss-btn-icon" onClick={onClose} aria-label="Close">
            <Icon.X size={18} />
          </button>
        </div>
        <div className="ss-modal-body">{children}</div>
        {footer && <div className="ss-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      width={400}
      footer={<>
        <button className="ss-btn ss-btn-secondary" onClick={onCancel}>Cancel</button>
        <button className={`ss-btn ${danger ? "ss-btn-danger" : "ss-btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
      </>}
    >
      <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}
