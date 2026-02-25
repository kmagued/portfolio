"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Quote, Project, Expense, Income, Currency } from "@/types/database";
import { useCurrency } from "@/lib/currency-context";

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

export default function AdminOverview() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("income").select("*").order("date", { ascending: false }),
    ]).then(([q, p, e, i]) => {
      if (q.data) setQuotes(q.data);
      if (p.data) setProjects(p.data);
      if (e.data) setExpenses(e.data);
      if (i.data) setIncome(i.data);
    });
  }, []);

  const { baseCurrency, toBase } = useCurrency();

  const convert = (amount: number, currency?: string) =>
    toBase(Number(amount), (currency || "EGP") as Currency);

  const fmtAmount = (amount: number) => {
    if (baseCurrency === "USD") return `$${Math.round(amount).toLocaleString()}`;
    if (baseCurrency === "EUR") return `€${Math.round(amount).toLocaleString()}`;
    return `${Math.round(amount).toLocaleString()} EGP`;
  };

  // All-time
  const totalIncome = income.reduce((s, i) => s + convert(i.amount, i.currency), 0);
  const totalExpenses = expenses.reduce((s, e) => s + convert(e.amount, e.currency), 0);

  // This month
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthIncome = income.filter((i) => i.date?.startsWith(thisMonth)).reduce((s, i) => s + convert(i.amount, i.currency), 0);
  const monthExpenses = expenses.filter((e) => e.date?.startsWith(thisMonth)).reduce((s, e) => s + convert(e.amount, e.currency), 0);

  const newQuotes = quotes.filter((q) => q.status === "new").length;
  const activeProjects = projects.filter((p) => p.status === "in_progress").length;

  // Chart
  type ChartRange = "30d" | "monthly" | "quarterly" | "annually";
  const [chartRange, setChartRange] = useState<ChartRange>("monthly");

  const chartData = useMemo(() => {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const inRange = (date: string | undefined, start: string, end: string) =>
      !!date && date >= start && date <= end;

    if (chartRange === "30d") {
      // Last 30 days grouped into 6 × 5-day buckets
      const buckets: { label: string; start: string; end: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 5);
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 5 - 4);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        const label = `${startDate.getDate()} ${monthNames[startDate.getMonth()].slice(0, 3)}`;
        buckets.push({ label, start: fmt(startDate), end: fmt(endDate) });
      }
      return buckets.map((b) => ({
        key: b.start,
        label: b.label,
        income: income.filter((i) => inRange(i.date, b.start, b.end)).reduce((s, i) => s + convert(i.amount, i.currency), 0),
        expenses: expenses.filter((e) => inRange(e.date, b.start, b.end)).reduce((s, e) => s + convert(e.amount, e.currency), 0),
      }));
    }

    if (chartRange === "quarterly") {
      // Last 4 quarters
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const quarters: { label: string; start: string; end: string }[] = [];
      for (let i = 3; i >= 0; i--) {
        const qStartDate = new Date(now.getFullYear(), now.getMonth() - ((now.getMonth() % 3) + i * 3), 1);
        const qEndDate = new Date(qStartDate.getFullYear(), qStartDate.getMonth() + 3, 0);
        const qNum = Math.floor(qStartDate.getMonth() / 3) + 1;
        quarters.push({
          label: `Q${qNum} ${String(qStartDate.getFullYear()).slice(2)}`,
          start: fmt(qStartDate),
          end: fmt(qEndDate),
        });
      }
      return quarters.map((q) => ({
        key: q.start,
        label: q.label,
        income: income.filter((i) => inRange(i.date, q.start, q.end)).reduce((s, i) => s + convert(i.amount, i.currency), 0),
        expenses: expenses.filter((e) => inRange(e.date, q.start, q.end)).reduce((s, e) => s + convert(e.amount, e.currency), 0),
      }));
    }

    if (chartRange === "annually") {
      // Last 4 years
      const years: number[] = [];
      for (let i = 3; i >= 0; i--) years.push(now.getFullYear() - i);
      return years.map((y) => {
        const prefix = String(y);
        return {
          key: prefix,
          label: prefix,
          income: income.filter((i) => i.date?.startsWith(prefix)).reduce((s, i) => s + convert(i.amount, i.currency), 0),
          expenses: expenses.filter((e) => e.date?.startsWith(prefix)).reduce((s, e) => s + convert(e.amount, e.currency), 0),
        };
      });
    }

    // monthly — last 6 months
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    return months.map((m) => {
      const [y, mo] = m.split("-");
      return {
        key: m,
        label: `${monthNames[parseInt(mo) - 1]} ${y.slice(2)}`,
        income: income.filter((i) => i.date?.startsWith(m)).reduce((s, i) => s + convert(i.amount, i.currency), 0),
        expenses: expenses.filter((e) => e.date?.startsWith(m)).reduce((s, e) => s + convert(e.amount, e.currency), 0),
      };
    });
  }, [income, expenses, toBase, baseCurrency, chartRange]);

  const maxChartVal = Math.max(...chartData.flatMap((d) => [d.income, d.expenses]), 1);
  const barCount = chartData.length;
  const chartWidth = Math.max(800, 80 + barCount * 90);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide mb-2">DASHBOARD</h1>
      <p className="text-sm text-[var(--text-dim)] mb-8">Welcome back, Khaled.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Income card */}
        <div className="admin-stat green">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Total Income</div>
              <div className="font-display text-3xl tracking-wide">{fmtAmount(totalIncome)}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-[var(--text-dim)]">This month</span>
                <span className="text-sm font-semibold text-green-400">{fmtAmount(monthIncome)}</span>
              </div>
            </div>
            <i className="fa-solid fa-arrow-trend-up text-xl text-[var(--text-dim)]/30" />
          </div>
        </div>

        {/* Expenses card */}
        <div className="admin-stat red">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Total Expenses</div>
              <div className="font-display text-3xl tracking-wide">{fmtAmount(totalExpenses)}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-[var(--text-dim)]">This month</span>
                <span className="text-sm font-semibold text-red-400">{fmtAmount(monthExpenses)}</span>
              </div>
            </div>
            <i className="fa-solid fa-arrow-trend-down text-xl text-[var(--text-dim)]/30" />
          </div>
        </div>

        {/* Net profit card */}
        <div className="admin-stat yellow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Net Profit</div>
              <div className="font-display text-3xl tracking-wide">{fmtAmount(totalIncome - totalExpenses)}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-[var(--text-dim)]">This month</span>
                <span className="text-sm font-semibold text-[var(--accent)]">{fmtAmount(monthIncome - monthExpenses)}</span>
              </div>
            </div>
            <i className="fa-solid fa-chart-line text-xl text-[var(--text-dim)]/30" />
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="admin-stat blue">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">New Requests</div>
              <div className="font-display text-3xl tracking-wide">{newQuotes}</div>
            </div>
            <i className="fa-solid fa-file-lines text-xl text-[var(--text-dim)]/30" />
          </div>
        </div>
        <div className="admin-stat purple">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Active Projects</div>
              <div className="font-display text-3xl tracking-wide">{activeProjects}</div>
            </div>
            <i className="fa-solid fa-folder-open text-xl text-[var(--text-dim)]/30" />
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="admin-card mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="font-display text-xl tracking-wide">OVERVIEW</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Income</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Expenses</span>
            </div>
          </div>
          <div className="flex gap-1">
            {([["30d", "30 Days"], ["monthly", "Monthly"], ["quarterly", "Quarterly"], ["annually", "Annually"]] as const).map(([val, lbl]) => (
              <button key={val} onClick={() => setChartRange(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${chartRange === val ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30" : "text-[var(--text-dim)] border border-[var(--border)] hover:text-[var(--text)]"}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Bar chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} 220`} className="w-full min-w-[400px]" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = 180 - pct * 160;
              return (
                <g key={pct}>
                  <line x1="60" y1={y} x2={chartWidth - 20} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <text x="52" y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">
                    {fmtAmount(Math.round(maxChartVal * pct))}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {chartData.map((d, i) => {
              const spacing = (chartWidth - 100) / barCount;
              const groupX = 80 + i * spacing;
              const barW = Math.min(28, spacing * 0.35);
              const incH = maxChartVal > 0 ? (d.income / maxChartVal) * 160 : 0;
              const expH = maxChartVal > 0 ? (d.expenses / maxChartVal) * 160 : 0;
              return (
                <g key={d.key}>
                  <rect x={groupX} y={180 - incH} width={barW} height={Math.max(incH, 0)} rx="4" fill="#22c55e" opacity="0.85" className="hover:opacity-100 transition-opacity cursor-pointer">
                    <title>{d.label} Income: {fmtAmount(Math.round(d.income))}</title>
                  </rect>
                  <rect x={groupX + barW + 4} y={180 - expH} width={barW} height={Math.max(expH, 0)} rx="4" fill="#ef4444" opacity="0.85" className="hover:opacity-100 transition-opacity cursor-pointer">
                    <title>{d.label} Expenses: {fmtAmount(Math.round(d.expenses))}</title>
                  </rect>
                  <text x={groupX + barW + 2} y="200" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Recent quotes */}
      <div className="admin-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl tracking-wide">RECENT REQUESTS</h3>
          <Link href="/admin/quotes" className="text-xs text-[var(--accent)] hover:underline">View all</Link>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Project Type</th><th>Budget</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {quotes.slice(0, 5).map((q) => (
                <tr key={q.id}>
                  <td className="font-medium">{q.name}</td>
                  <td className="text-[var(--text-dim)]">{q.project_types?.join(", ") || "—"}</td>
                  <td className="text-[var(--text-dim)]">{q.budget || "—"}</td>
                  <td><span className={`status-badge status-${q.status}`}>{statusLabels[q.status] || q.status}</span></td>
                  <td className="text-[var(--text-dim)] text-xs">{new Date(q.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {quotes.length === 0 && <tr><td colSpan={5} className="text-center text-[var(--text-dim)] py-8">No quote requests yet. They&apos;ll appear here when someone submits the form.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {quotes.slice(0, 5).map((q) => (
            <div key={q.id} className="bg-white/[0.02] border border-[var(--border)] rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{q.name}</span>
                <span className={`status-badge status-${q.status}`}>{statusLabels[q.status] || q.status}</span>
              </div>
              <div className="text-xs text-[var(--text-dim)] space-y-1">
                {q.project_types?.length ? <div>Type: {q.project_types.join(", ")}</div> : null}
                {q.budget && <div>Budget: {q.budget}</div>}
                <div>{new Date(q.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
          {quotes.length === 0 && <div className="text-center text-[var(--text-dim)] py-8">No quote requests yet.</div>}
        </div>
      </div>
    </div>
  );
}
