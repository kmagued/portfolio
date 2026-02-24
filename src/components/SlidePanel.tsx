"use client";

import { useEffect } from "react";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlidePanel({ open, onClose, title, children }: SlidePanelProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel — right on desktop, bottom on mobile */}
      <div className={`fixed z-[201] bg-[#111] border-[var(--border)] transition-transform duration-300 ease-out flex flex-col
        inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t
        md:inset-y-0 md:inset-x-auto md:right-0 md:w-[420px] md:max-h-none md:rounded-t-none md:rounded-l-2xl md:border-t-0 md:border-l
        ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <h3 className="font-display text-xl tracking-wide">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </>
  );
}
