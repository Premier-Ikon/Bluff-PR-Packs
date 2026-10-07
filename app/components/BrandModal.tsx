"use client";

import { ReactNode, useEffect, useId } from "react";
import { createPortal } from "react-dom";

export function BrandModal({
  open,
  title,
  children,
  onClose,
  dismissAnywhere = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  dismissAnywhere?: boolean;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="brand-modal-root"
      role="presentation"
      onClick={dismissAnywhere ? () => onClose?.() : undefined}
    >
      <button className="brand-modal-backdrop" type="button" aria-label="Close" onClick={onClose} />
      <div className="brand-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <p className="brand-modal-eyebrow">Bluff Friends</p>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}
