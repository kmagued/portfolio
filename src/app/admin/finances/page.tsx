"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Expense, Income, Currency, IncomeSource, Project } from "@/types/database";
import SlidePanel from "@/components/SlidePanel";
import DatePicker from "@/components/DatePicker";
import { useCurrency } from "@/lib/currency-context";

const categories = ["hosting", "tools", "marketing", "salary", "equipment", "general", "other"] as const;
const categoryLabels: Record<string, string> = {
  hosting: "Hosting", tools: "Tools", marketing: "Marketing", salary: "Salary",
  equipment: "Equipment", general: "General", other: "Other",
};
const sources: IncomeSource[] = ["project", "freelance", "subscription", "other"];
const sourceLabels: Record<string, string> = {
  project: "Project", freelance: "Freelance", subscription: "Subscription", other: "Other",
};
const currencies: Currency[] = ["EGP", "USD", "EUR"];

const fmtAmount = (amount: number, currency: Currency = "EGP") => {
  if (currency === "USD") return `$${amount.toLocaleString()}`;
  if (currency === "EUR") return `€${amount.toLocaleString()}`;
  return `${amount.toLocaleString()} EGP`;
};

type FormType = "expense" | "income";
type SortField = "date" | "amount" | "title";
type SortDir = "asc" | "desc";

export default function AdminFinances() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [projects, setProjects] = useState<Pick<Project, "id" | "name">[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<FormType>("expense");
  const [saving, setSaving] = useState(false);

  // Shared form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("EGP");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");
  // Expense-only
  const [category, setCategory] = useState<string>("general");
  const [recurring, setRecurring] = useState(false);
  // Income-only
  const [source, setSource] = useState<IncomeSource>("project");

  // Filters (global)
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  // Section-level filters (empty array = all)
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterSources, setFilterSources] = useState<string[]>([]);

  // Sort
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [incomePage, setIncomePage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const PAGE_SIZE = 5;

  // Mobile filter dialog
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Shared currency context
  const { baseCurrency, rates, toBase } = useCurrency();

  const loadData = async () => {
    const [e, i, p] = await Promise.all([
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("income").select("*").order("date", { ascending: false }),
      supabase.from("projects").select("id,name").order("name"),
    ]);
    if (e.data) setExpenses(e.data);
    if (i.data) setIncome(i.data);
    if (p.data) setProjects(p.data as Pick<Project, "id" | "name">[]);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setTitle(""); setAmount(""); setCurrency("EGP"); setCategory("general");
    setDate(new Date().toISOString().split("T")[0]); setProjectId(""); setNotes("");
    setRecurring(false); setSource("project");
  };

  const openForm = (type: FormType) => {
    resetForm();
    setFormType(type);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title || !amount) return;
    setSaving(true);
    if (formType === "expense") {
      await supabase.from("expenses").insert({
        title, amount: parseFloat(amount), currency, category, date,
        project_id: projectId || null, notes: notes || null, recurring,
      } as never);
    } else {
      await supabase.from("income").insert({
        title, amount: parseFloat(amount), currency, source, date,
        project_id: projectId || null, notes: notes || null,
      } as never);
      // Add income amount to project's paid total
      if (projectId) {
        const { data: proj } = await supabase.from("projects").select("paid, currency").eq("id", projectId).single();
        const currentPaid = Number(proj?.paid || 0);
        const projCurrency = proj?.currency || "EGP";
        let added = parseFloat(amount);
        if (rates && currency !== projCurrency) {
          added = (added / (rates[currency] || 1)) * (rates[projCurrency] || 1);
        }
        await supabase.from("projects").update({ paid: Math.round(currentPaid + added) } as never).eq("id", projectId);
      }
    }
    setSaving(false);
    resetForm();
    setShowForm(false);
    loadData();
  };

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  // Available months from all data
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    [...expenses, ...income].forEach((item) => {
      if (item.date) monthSet.add(item.date.slice(0, 7));
    });
    return [...monthSet].sort().reverse();
  }, [expenses, income]);

  // Filter + sort helpers
  const matchesFilters = (item: { date: string; project_id: string | null }) => {
    if (filterMonth !== "all" && (!item.date || !item.date.startsWith(filterMonth))) return false;
    if (filterProject !== "all") {
      if (filterProject === "none" && item.project_id) return false;
      if (filterProject !== "none" && item.project_id !== filterProject) return false;
    }
    return true;
  };

  const sortItems = <T extends { date: string; amount: number; title: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date);
      else if (sortField === "amount") cmp = Number(a.amount) - Number(b.amount);
      else if (sortField === "title") cmp = a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    });
  };

  const filteredExpenses = useMemo(() => {
    setExpensePage(1);
    return sortItems(expenses.filter((e) => {
      if (!matchesFilters(e)) return false;
      if (filterCategories.length > 0 && !filterCategories.includes(e.category)) return false;
      return true;
    }));
  }, [expenses, filterMonth, filterProject, filterCategories, sortField, sortDir]);

  const filteredIncome = useMemo(() => {
    setIncomePage(1);
    return sortItems(income.filter((i) => {
      if (!matchesFilters(i)) return false;
      if (filterSources.length > 0 && !filterSources.includes(i.source)) return false;
      return true;
    }));
  }, [income, filterMonth, filterProject, filterSources, sortField, sortDir]);

  // Pagination
  const incomePages = Math.ceil(filteredIncome.length / PAGE_SIZE) || 1;
  const expensePages = Math.ceil(filteredExpenses.length / PAGE_SIZE) || 1;
  const paginatedIncome = filteredIncome.slice((incomePage - 1) * PAGE_SIZE, incomePage * PAGE_SIZE);
  const paginatedExpenses = filteredExpenses.slice((expensePage - 1) * PAGE_SIZE, expensePage * PAGE_SIZE);

  // Totals (converted to base currency)
  const totalIncome = useMemo(() =>
    filteredIncome.reduce((sum, i) => sum + toBase(Number(i.amount), i.currency), 0),
    [filteredIncome, toBase]);

  const totalExpenses = useMemo(() =>
    filteredExpenses.reduce((sum, e) => sum + toBase(Number(e.amount), e.currency), 0),
    [filteredExpenses, toBase]);

  const netProfit = totalIncome - totalExpenses;

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return "fa-sort text-white/20";
    return sortDir === "asc" ? "fa-sort-up text-[var(--accent)]" : "fa-sort-down text-[var(--accent)]";
  };

  const hasActiveFilters = filterMonth !== "all" || filterProject !== "all";

  const clearFilters = () => {
    setFilterMonth("all"); setFilterProject("all");
  };

  const fmtMonth = (ym: string) => {
    const [y, m] = ym.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  const inputClass = "w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20";
  const selectFilter = "bg-white/[0.04] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors";
  const isExpense = formType === "expense";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-wide mb-2">FINANCES</h1>
          <p className="text-sm text-[var(--text-dim)]">Track income and expenses across all projects.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => openForm("income")}
            className="px-5 py-2.5 rounded-lg border border-green-500/20 text-green-400 font-semibold text-sm tracking-wider uppercase hover:bg-green-500/5 transition-colors">
            <i className="fa-solid fa-plus mr-2" />Add Income
          </button>
          <button onClick={() => openForm("expense")}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-wider uppercase hover:bg-white transition-colors">
            <i className="fa-solid fa-plus mr-2" />Add Expense
          </button>
        </div>
      </div>

      {/* Add Entry Slide Panel */}
      <SlidePanel open={showForm} onClose={() => setShowForm(false)} title={isExpense ? "NEW EXPENSE" : "NEW INCOME"}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={isExpense ? "e.g. Vercel Pro Plan" : "e.g. Clash monthly payment"}
              className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Amount</label>
            <div className="flex gap-2">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="flex-1 bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20" />
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-20 bg-white/[0.04] border border-[var(--border)] rounded-lg px-2 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors text-center">
                {currencies.map((c) => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
              </select>
            </div>
          </div>
          {isExpense ? (
            <div>
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {categories.map((c) => <option key={c} value={c} className="bg-[#111]">{categoryLabels[c]}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value as IncomeSource)} className={inputClass}>
                {sources.map((s) => <option key={s} value={s} className="bg-[#111]">{sourceLabels[s]}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Date</label>
            <DatePicker value={date} onChange={setDate} />
          </div>
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Project (optional)</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
              <option value="" className="bg-[#111]">None</option>
              {projects.map((p) => <option key={p.id} value={p.id} className="bg-[#111]">{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Notes (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." className={inputClass} />
          </div>
          {isExpense && (
            <label className="flex items-center gap-2 text-sm text-[var(--text-dim)] cursor-pointer">
              <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)]" />
              Recurring expense
            </label>
          )}
          <button onClick={handleSubmit} disabled={!title || !amount || saving}
            className={`w-full py-3 rounded-lg font-semibold text-sm tracking-wider uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              isExpense
                ? "bg-[var(--accent)] text-[#0a0a0a] hover:bg-white"
                : "bg-green-500 text-[#0a0a0a] hover:bg-green-400"
            }`}>
            {saving ? "Saving..." : isExpense ? "Save Expense" : "Save Income"}
          </button>
        </div>
      </SlidePanel>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="admin-stat green">
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Total Income</div>
          <div className="font-display text-3xl tracking-wide">{fmtAmount(Math.round(totalIncome), baseCurrency)}</div>
        </div>
        <div className="admin-stat red">
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Total Expenses</div>
          <div className="font-display text-3xl tracking-wide">{fmtAmount(Math.round(totalExpenses), baseCurrency)}</div>
        </div>
        <div className="admin-stat yellow">
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Net Profit</div>
          <div className="font-display text-3xl tracking-wide">{fmtAmount(Math.round(netProfit), baseCurrency)}</div>
        </div>
      </div>

      {/* Filter bar — desktop only */}
      <div className="hidden md:block admin-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold">
            <i className="fa-solid fa-filter" /> Filters
          </div>

          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className={selectFilter}>
            <option value="all" className="bg-[#111]">All Months</option>
            {availableMonths.map((m) => <option key={m} value={m} className="bg-[#111]">{fmtMonth(m)}</option>)}
          </select>

          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={selectFilter}>
            <option value="all" className="bg-[#111]">All Projects</option>
            <option value="none" className="bg-[#111]">No Project</option>
            {projects.map((p) => <option key={p.id} value={p.id} className="bg-[#111]">{p.name}</option>)}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-[var(--accent)] hover:text-white transition-colors">
              <i className="fa-solid fa-xmark mr-1" />Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter FAB */}
      <button onClick={() => setShowMobileFilters(true)}
        className="md:hidden fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-[var(--accent)] text-[#0a0a0a] shadow-lg flex items-center justify-center">
        <i className="fa-solid fa-sliders text-lg" />
        {hasActiveFilters && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[0.6rem] flex items-center justify-center font-bold">!</span>}
      </button>

      {/* Mobile filter bottom sheet */}
      <div className={`md:hidden fixed inset-0 z-[70] transition-opacity duration-300 ${showMobileFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-[var(--border)] rounded-t-2xl p-5 transition-transform duration-300 ease-out max-h-[80vh] overflow-y-auto ${showMobileFilters ? "translate-y-0" : "translate-y-full"}`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg tracking-wide">FILTERS & SORT</h3>
            <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 flex items-center justify-center text-[var(--text-dim)]">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Month</label>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className={inputClass}>
                <option value="all" className="bg-[#111]">All Months</option>
                {availableMonths.map((m) => <option key={m} value={m} className="bg-[#111]">{fmtMonth(m)}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Project</label>
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={inputClass}>
                <option value="all" className="bg-[#111]">All Projects</option>
                <option value="none" className="bg-[#111]">No Project</option>
                {projects.map((p) => <option key={p.id} value={p.id} className="bg-[#111]">{p.name}</option>)}
              </select>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Sort By</label>
              <div className="flex gap-2">
                {(["date", "amount", "title"] as SortField[]).map((f) => (
                  <button key={f} onClick={() => toggleSort(f)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm capitalize transition-colors ${sortField === f ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] text-[var(--text-dim)]"}`}>
                    {f} {sortField === f && <i className={`fa-solid ${sortDir === "asc" ? "fa-arrow-up" : "fa-arrow-down"} ml-1 text-[0.6rem]`} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {hasActiveFilters && (
                <button onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                  className="flex-1 py-3 rounded-lg border border-[var(--border)] text-sm text-[var(--text-dim)] font-semibold uppercase tracking-wider">
                  Clear All
                </button>
              )}
              <button onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-[#0a0a0a] text-sm font-semibold uppercase tracking-wider">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl tracking-wide text-green-400">
              <i className="fa-solid fa-arrow-trend-up mr-2" />INCOME
              <span className="text-sm font-sans text-[var(--text-dim)] ml-2">({filteredIncome.length})</span>
            </h3>
            <MultiSelect
              options={sources.map((s) => ({ value: s, label: sourceLabels[s] }))}
              selected={filterSources}
              onChange={setFilterSources}
              placeholder="All Sources"
            />
          </div>
          <div className="hidden md:block admin-card">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort("title")}>
                      Title <i className={`fa-solid ${sortIcon("title")} ml-1 text-[0.6rem]`} />
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort("amount")}>
                      Amount <i className={`fa-solid ${sortIcon("amount")} ml-1 text-[0.6rem]`} />
                    </th>
                    <th>Source</th>
                    <th>Project</th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort("date")}>
                      Date <i className={`fa-solid ${sortIcon("date")} ml-1 text-[0.6rem]`} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIncome.map((i) => (
                    <tr key={i.id}>
                      <td className="font-medium">{i.title}</td>
                      <td className="text-green-400 whitespace-nowrap">
                        {fmtAmount(Math.round(toBase(Number(i.amount), i.currency)), baseCurrency)}
                        {i.currency !== baseCurrency && <div className="text-[0.65rem] text-[var(--text-dim)] font-normal">{fmtAmount(Number(i.amount), i.currency)}</div>}
                      </td>
                      <td><span className="status-badge status-accepted">{sourceLabels[i.source] || i.source}</span></td>
                      <td className="text-[var(--text-dim)] text-xs">{i.project_id ? projectMap[i.project_id] || "—" : "—"}</td>
                      <td className="text-[var(--text-dim)] text-xs">{i.date}</td>
                    </tr>
                  ))}
                  {filteredIncome.length === 0 && <tr><td colSpan={5} className="text-center text-[var(--text-dim)] py-6">No income records.</td></tr>}
                </tbody>
                {filteredIncome.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-[var(--border)]">
                      <td className="font-semibold text-xs uppercase tracking-wide text-[var(--text-dim)] py-3">Total</td>
                      <td className="text-green-400 font-semibold whitespace-nowrap py-3">{fmtAmount(Math.round(totalIncome), baseCurrency)}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {incomePages > 1 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-xs text-[var(--text-dim)]">Page {incomePage} of {incomePages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setIncomePage((p) => Math.max(1, p - 1))} disabled={incomePage === 1}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {Array.from({ length: incomePages }, (_, i) => (
                    <button key={i} onClick={() => setIncomePage(i + 1)}
                      className={`w-8 h-8 rounded-lg border text-xs transition-colors ${incomePage === i + 1 ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)]"}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setIncomePage((p) => Math.min(incomePages, p + 1))} disabled={incomePage === incomePages}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="md:hidden flex flex-col gap-3">
            {paginatedIncome.map((i) => (
              <div key={i.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{i.title}</span>
                      <span className="status-badge status-accepted shrink-0">{sourceLabels[i.source] || i.source}</span>
                    </div>
                    <div className="text-[0.65rem] text-[var(--text-dim)] mt-1.5">{i.date}</div>
                    {i.project_id && projectMap[i.project_id] && (
                      <div className="text-[0.65rem] text-[var(--text-dim)] mt-1.5"><i className="fa-solid fa-folder-open mr-1" />{projectMap[i.project_id]}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-green-400 font-semibold text-sm">{fmtAmount(Math.round(toBase(Number(i.amount), i.currency)), baseCurrency)}</div>
                    {i.currency !== baseCurrency && <div className="text-[0.6rem] text-[var(--text-dim)] mt-0.5">{fmtAmount(Number(i.amount), i.currency)}</div>}
                  </div>
                </div>
              </div>
            ))}
            {filteredIncome.length > 0 && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">Total</span>
                <span className="text-green-400 font-semibold text-sm">{fmtAmount(Math.round(totalIncome), baseCurrency)}</span>
              </div>
            )}
            {filteredIncome.length === 0 && <div className="text-center text-[var(--text-dim)] py-6">No income records.</div>}
            {incomePages > 1 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[var(--text-dim)]">Page {incomePage} of {incomePages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setIncomePage((p) => Math.max(1, p - 1))} disabled={incomePage === 1}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {Array.from({ length: incomePages }, (_, i) => (
                    <button key={i} onClick={() => setIncomePage(i + 1)}
                      className={`w-8 h-8 rounded-lg border text-xs transition-colors ${incomePage === i + 1 ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)]"}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setIncomePage((p) => Math.min(incomePages, p + 1))} disabled={incomePage === incomePages}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl tracking-wide text-red-400">
              <i className="fa-solid fa-arrow-trend-down mr-2" />EXPENSES
              <span className="text-sm font-sans text-[var(--text-dim)] ml-2">({filteredExpenses.length})</span>
            </h3>
            <MultiSelect
              options={categories.map((c) => ({ value: c, label: categoryLabels[c] }))}
              selected={filterCategories}
              onChange={setFilterCategories}
              placeholder="All Categories"
            />
          </div>
          <div className="hidden md:block admin-card">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort("title")}>
                      Title <i className={`fa-solid ${sortIcon("title")} ml-1 text-[0.6rem]`} />
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort("amount")}>
                      Amount <i className={`fa-solid ${sortIcon("amount")} ml-1 text-[0.6rem]`} />
                    </th>
                    <th>Category</th>
                    <th>Project</th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort("date")}>
                      Date <i className={`fa-solid ${sortIcon("date")} ml-1 text-[0.6rem]`} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.map((e) => (
                    <tr key={e.id}>
                      <td className="font-medium">{e.title}</td>
                      <td className="text-red-400 whitespace-nowrap">
                        {fmtAmount(Math.round(toBase(Number(e.amount), e.currency)), baseCurrency)}
                        {e.currency !== baseCurrency && <div className="text-[0.65rem] text-[var(--text-dim)] font-normal">{fmtAmount(Number(e.amount), e.currency)}</div>}
                      </td>
                      <td><span className="status-badge status-declined">{categoryLabels[e.category] || e.category}</span></td>
                      <td className="text-[var(--text-dim)] text-xs">{e.project_id ? projectMap[e.project_id] || "—" : "—"}</td>
                      <td className="text-[var(--text-dim)] text-xs">{e.date}</td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && <tr><td colSpan={5} className="text-center text-[var(--text-dim)] py-6">No expense records.</td></tr>}
                </tbody>
                {filteredExpenses.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-[var(--border)]">
                      <td className="font-semibold text-xs uppercase tracking-wide text-[var(--text-dim)] py-3">Total</td>
                      <td className="text-red-400 font-semibold whitespace-nowrap py-3">{fmtAmount(Math.round(totalExpenses), baseCurrency)}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {expensePages > 1 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-xs text-[var(--text-dim)]">Page {expensePage} of {expensePages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setExpensePage((p) => Math.max(1, p - 1))} disabled={expensePage === 1}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {Array.from({ length: expensePages }, (_, i) => (
                    <button key={i} onClick={() => setExpensePage(i + 1)}
                      className={`w-8 h-8 rounded-lg border text-xs transition-colors ${expensePage === i + 1 ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)]"}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setExpensePage((p) => Math.min(expensePages, p + 1))} disabled={expensePage === expensePages}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="md:hidden flex flex-col gap-3">
            {paginatedExpenses.map((e) => (
              <div key={e.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{e.title}</span>
                      <span className="status-badge status-declined shrink-0">{categoryLabels[e.category] || e.category}</span>
                    </div>
                    <div className="text-[0.65rem] text-[var(--text-dim)] mt-1.5">{e.date}</div>
                    {e.project_id && projectMap[e.project_id] && (
                      <div className="text-[0.65rem] text-[var(--text-dim)] mt-1.5"><i className="fa-solid fa-folder-open mr-1" />{projectMap[e.project_id]}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-red-400 font-semibold text-sm">{fmtAmount(Math.round(toBase(Number(e.amount), e.currency)), baseCurrency)}</div>
                    {e.currency !== baseCurrency && <div className="text-[0.6rem] text-[var(--text-dim)] mt-0.5">{fmtAmount(Number(e.amount), e.currency)}</div>}
                  </div>
                </div>
              </div>
            ))}
            {filteredExpenses.length > 0 && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">Total</span>
                <span className="text-red-400 font-semibold text-sm">{fmtAmount(Math.round(totalExpenses), baseCurrency)}</span>
              </div>
            )}
            {filteredExpenses.length === 0 && <div className="text-center text-[var(--text-dim)] py-6">No expense records.</div>}
            {expensePages > 1 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[var(--text-dim)]">Page {expensePage} of {expensePages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setExpensePage((p) => Math.max(1, p - 1))} disabled={expensePage === 1}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {Array.from({ length: expensePages }, (_, i) => (
                    <button key={i} onClick={() => setExpensePage(i + 1)}
                      className={`w-8 h-8 rounded-lg border text-xs transition-colors ${expensePage === i + 1 ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)]"}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setExpensePage((p) => Math.min(expensePages, p + 1))} disabled={expensePage === expensePages}
                    className="w-8 h-8 rounded-lg border border-[var(--border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiSelect({ options, selected, onChange, placeholder }: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  };

  const label = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 bg-white/[0.04] border rounded-lg px-3 py-2 text-sm transition-colors ${selected.length > 0 ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)]"}`}>
        {label}
        <i className={`fa-solid fa-chevron-down text-[0.5rem] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-[#1a1a1a] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
          {options.map((o) => (
            <button key={o.value} onClick={() => toggle(o.value)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-white/[0.04] transition-colors">
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.includes(o.value) ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)]"}`}>
                {selected.includes(o.value) && <i className="fa-solid fa-check text-[0.5rem] text-[#0a0a0a]" />}
              </span>
              <span className={selected.includes(o.value) ? "text-[var(--text)]" : "text-[var(--text-dim)]"}>{o.label}</span>
            </button>
          ))}
          {selected.length > 0 && (
            <button onClick={() => onChange([])}
              className="w-full px-3 py-2 text-xs text-[var(--accent)] border-t border-[var(--border)] hover:bg-white/[0.04] transition-colors">
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
