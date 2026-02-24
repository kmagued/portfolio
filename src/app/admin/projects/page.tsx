"use client";

import { useState, useEffect } from "react";
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

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase.from("projects").select("*").order("display_order").then(({ data }) => {
      if (data) setProjects(data);
    });
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p) => (
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
              <span>{p.start_date || "No start date"}</span>
              {p.client && <span><span className="text-[var(--text-dim)]">Paid </span><span className="text-[var(--text)]">{Number(p.paid || 0).toLocaleString()} {p.currency || "EGP"}</span></span>}
            </div>
          </Link>
        ))}
      </div>
      {projects.length === 0 && <div className="text-center text-[var(--text-dim)] py-12">No projects yet. Add your first project.</div>}
    </div>
  );
}
