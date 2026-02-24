"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/database";

const statusLabels: Record<string, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statuses = ["planning", "in_progress", "on_hold", "completed", "cancelled"];

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "client" | "personal">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("projects").select("*").order("display_order").then(({ data }) => {
      if (data) setProjects([...data].sort((a, b) => (a.client ? 0 : 1) - (b.client ? 0 : 1)));
    });
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterType === "client" && !p.client) return false;
      if (filterType === "personal" && p.client) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchClient = p.client?.toLowerCase().includes(q);
        const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchClient && !matchTags) return false;
      }
      return true;
    });
  }, [projects, filterStatus, filterType, search]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const hasFilters = filterStatus !== "all" || filterType !== "all" || search !== "";
  const clearAll = () => { setFilterStatus("all"); setFilterType("all"); setSearch(""); };
  const selectClass = "bg-white/[0.04] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors";
  const inputClass = "w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-wide mb-2">PROJECTS</h1>
          <p className="text-sm text-[var(--text-dim)]">Track active and completed projects.</p>
        </div>
        <Link href="/admin/projects/new"
          className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-wider uppercase hover:bg-white transition-colors shrink-0 text-center">
          <i className="fa-solid fa-plus mr-2" />Add Project
        </Link>
      </div>

      {/* Filters — desktop */}
      <div className="hidden md:block admin-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold">
            <i className="fa-solid fa-filter" /> Filters
          </div>

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-xs" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..."
              className="w-full bg-white/[0.04] border border-[var(--border)] rounded-lg pl-8 pr-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20" />
          </div>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="all" className="bg-[#111]">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s} className="bg-[#111]">{statusLabels[s]}</option>)}
          </select>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value as "all" | "client" | "personal")} className={selectClass}>
            <option value="all" className="bg-[#111]">All Types</option>
            <option value="client" className="bg-[#111]">Client</option>
            <option value="personal" className="bg-[#111]">Personal</option>
          </select>

          {hasFilters && (
            <button onClick={clearAll} className="ml-auto text-xs text-[var(--accent)] hover:text-white transition-colors">
              <i className="fa-solid fa-xmark mr-1" />Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter FAB */}
      <button onClick={() => setShowMobileFilters(true)}
        className="md:hidden fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-[var(--accent)] text-[#0a0a0a] shadow-lg flex items-center justify-center">
        <i className="fa-solid fa-sliders text-lg" />
        {hasFilters && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[0.6rem] flex items-center justify-center font-bold">!</span>}
      </button>

      {/* Mobile filter bottom sheet */}
      <div className={`md:hidden fixed inset-0 z-[70] transition-opacity duration-300 ${showMobileFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-[#111] border-t border-[var(--border)] rounded-t-2xl p-5 transition-transform duration-300 ease-out max-h-[80vh] overflow-y-auto ${showMobileFilters ? "translate-y-0" : "translate-y-full"}`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg tracking-wide">FILTERS</h3>
            <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 flex items-center justify-center text-[var(--text-dim)]">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Search</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className={inputClass} />
            </div>

            <div>
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
                <option value="all" className="bg-[#111]">All Statuses</option>
                {statuses.map((s) => <option key={s} value={s} className="bg-[#111]">{statusLabels[s]}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block">Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value as "all" | "client" | "personal")} className={inputClass}>
                <option value="all" className="bg-[#111]">All Types</option>
                <option value="client" className="bg-[#111]">Client</option>
                <option value="personal" className="bg-[#111]">Personal</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              {hasFilters && (
                <button onClick={() => { clearAll(); setShowMobileFilters(false); }}
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Link key={p.id} href={`/admin/projects/${p.id}`}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 flex flex-col hover:border-[var(--accent)]/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-[var(--text)]">{p.name}</div>
                <div className="text-xs text-[var(--text-dim)] mt-0.5">
                  {p.client ? <><i className="fa-solid fa-user mr-1" />{p.client}</> : <><i className="fa-solid fa-code mr-1" />Personal Project</>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {p.published && (
                  <span className="w-2 h-2 rounded-full bg-green-400" title="Published" />
                )}
                <span className={`status-badge status-${p.status}`}>{statusLabels[p.status] || p.status}</span>
              </div>
            </div>

            {p.description && <p className="text-sm text-[var(--text-dim)] mb-3 line-clamp-2">{p.description}</p>}

            {p.tags?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {p.tags.slice(0, 4).map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-white/[0.04] border border-[var(--border)] rounded-full text-xs text-[var(--text-dim)]">{t}</span>
                ))}
                {p.tags.length > 4 && <span className="text-xs text-[var(--text-dim)]">+{p.tags.length - 4}</span>}
              </div>
            )}

            <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-dim)]">
              <span>{p.start_date ? new Date(p.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No start date"}</span>
              {p.client && <span><span className="text-[var(--text-dim)]">Paid </span><span className="text-[var(--text)]">{Number(p.paid || 0).toLocaleString()} {p.currency || "EGP"}</span></span>}
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && projects.length > 0 && <div className="text-center text-[var(--text-dim)] py-12">No projects match your filters.</div>}
      {projects.length === 0 && <div className="text-center text-[var(--text-dim)] py-12">No projects yet. Add your first project.</div>}
    </div>
  );
}
