"use client";

import { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; current: boolean; date: string }[] = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth === 0 ? 12 : viewMonth;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, current: false, date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      current: true,
      date: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  // Next month padding
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 1 : viewMonth + 2;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, current: false, date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none hover:border-[var(--accent)] transition-colors text-left flex items-center justify-between">
        <span>{value ? new Date(value + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}</span>
        <i className="fa-solid fa-calendar text-[var(--text-dim)] text-xs" />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-[280px] bg-[#111] border border-[var(--border)] rounded-xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.04] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
            <span className="text-sm font-semibold tracking-wide">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.04] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[0.6rem] text-[var(--text-dim)] font-semibold uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const isSelected = cell.date === value;
              const isToday = cell.date === today;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(cell.date); setOpen(false); }}
                  className={`h-8 text-xs rounded-lg transition-all
                    ${!cell.current ? "text-[var(--text-dim)]/40" : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-white/[0.04]"}
                    ${isSelected ? "!bg-[var(--accent)] !text-[#0a0a0a] font-semibold" : ""}
                    ${isToday && !isSelected ? "text-[var(--accent)] font-semibold" : ""}
                  `}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <button type="button" onClick={() => { onChange(today); setOpen(false); }}
            className="w-full mt-2 py-1.5 text-xs text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-lg transition-colors font-semibold">
            Today
          </button>
        </div>
      )}
    </div>
  );
}
