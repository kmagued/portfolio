"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Quote } from "@/types/database";

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const loadQuotes = async () => {
    const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (data) setQuotes(data);
  };

  useEffect(() => { loadQuotes(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("quotes").update({ status } as never).eq("id", id);
    loadQuotes();
  };

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide mb-2">QUOTE REQUESTS</h1>
      <p className="text-sm text-[var(--text-dim)] mb-8">Manage incoming quote requests from your portfolio.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {quotes.map((q) => (
          <Link key={q.id} href={`/admin/quotes/${q.id}`}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 flex flex-col hover:border-[var(--accent)]/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-[var(--text)]">{q.name}</div>
                <span onClick={(e) => e.stopPropagation()} className="inline-block">
                  <a href={`mailto:${q.email}`} className="text-[var(--accent)] text-sm hover:underline">{q.email}</a>
                </span>
              </div>
              <span className={`status-badge status-${q.status} shrink-0 ml-3`}>{statusLabels[q.status] || q.status}</span>
            </div>

            {q.description && <p className="text-sm text-[var(--text-dim)] mb-3 line-clamp-3">{q.description}</p>}

            <div className="text-xs text-[var(--text-dim)] space-y-1.5 mb-4">
              {q.project_types?.length ? (
                <div className="flex gap-1.5 flex-wrap">
                  {q.project_types.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-white/[0.04] border border-[var(--border)] rounded-full">{t}</span>
                  ))}
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Budget</span>
                <span className="text-[var(--text)]">{q.budget || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeline</span>
                <span className="text-[var(--text)]">{q.timeline || "—"}</span>
              </div>
            </div>

            <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-dim)]">{new Date(q.created_at).toLocaleDateString()}</span>
              <div onClick={(e) => e.preventDefault()}>
                <select value={q.status} onChange={(e) => { e.stopPropagation(); updateStatus(q.id, e.target.value); }}
                  className="bg-white/[0.04] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] outline-none">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[#111]">{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {quotes.length === 0 && <div className="text-center text-[var(--text-dim)] py-12">No quote requests yet.</div>}
    </div>
  );
}
