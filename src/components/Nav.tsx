"use client";

import { useState } from "react";

const links = [
  { label: "About", href: "#about", icon: "fa-user" },
  { label: "Projects", href: "#projects", icon: "fa-folder-open" },
  { label: "Stack", href: "#stack", icon: "fa-layer-group" },
  { label: "Contact", href: "#contact", icon: "fa-paper-plane" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 py-4 flex justify-between items-center backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-[var(--border)]">
        <a href="#" className="font-display text-[1.6rem] tracking-[3px] text-[var(--accent)]">
          SPORT × CODE
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-[0.7rem] font-semibold tracking-[2px] uppercase text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-white/[0.04] rounded-lg transition-all inline-flex items-center gap-2"
            >
              <i className={`fa-solid ${l.icon} text-[0.6rem]`} />{l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="ml-3 px-5 py-2 text-[0.7rem] font-semibold tracking-[2px] uppercase bg-[var(--accent)] text-[#0a0a0a] rounded-full hover:bg-white transition-colors"
          >
            Get a Quote
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] relative z-[110]"
          aria-label="Toggle menu"
        >
          <span className={`w-5 h-[1.5px] bg-[var(--text)] transition-all duration-300 ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`w-5 h-[1.5px] bg-[var(--text)] transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`w-5 h-[1.5px] bg-[var(--text)] transition-all duration-300 ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </nav>

      {/* Mobile overlay — outside nav to avoid backdrop-filter containing block */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] md:hidden transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile slide-out panel — outside nav to avoid backdrop-filter containing block */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#0a0a0a] border-l border-[var(--border)] z-[102] md:hidden transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col pt-24 px-8 gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-semibold tracking-[2px] uppercase text-[var(--text-dim)] hover:text-[var(--accent)] border-b border-[var(--border)]/50 transition-colors flex items-center gap-3"
            >
              <i className={`fa-solid ${l.icon} text-xs w-4 text-center`} />{l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-6 py-3 text-center text-sm font-semibold tracking-[2px] uppercase bg-[var(--accent)] text-[#0a0a0a] rounded-full hover:bg-white transition-colors"
          >
            Get a Quote
          </a>
        </div>
      </div>
    </>
  );
}
