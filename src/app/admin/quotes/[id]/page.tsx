"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function QuoteDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("quotes").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setQuote(data);
        setNotes(data.notes || "");
      }
      setLoading(false);
    });
  }, [id]);

  const updateStatus = async (status: string) => {
    await supabase.from("quotes").update({ status } as never).eq("id", id);
    setQuote((prev) => prev ? { ...prev, status: status as Quote["status"] } : prev);
  };

  const saveNotes = async () => {
    setSaving(true);
    await supabase.from("quotes").update({ notes } as never).eq("id", id);
    setQuote((prev) => prev ? { ...prev, notes } : prev);
    setSaving(false);
  };

  const deleteQuote = async () => {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    await supabase.from("quotes").delete().eq("id", id);
    router.push("/admin/quotes");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--accent)]" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-20">
        <div className="text-[var(--text-dim)] mb-4">Quote not found.</div>
        <Link href="/admin/quotes" className="text-[var(--accent)] hover:underline text-sm">Back to Quotes</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/quotes" className="inline-flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors mb-6">
        <i className="fa-solid fa-arrow-left" /> Back to Quotes
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-wide mb-1">{quote.name}</h1>
          <a href={`mailto:${quote.email}`} className="text-[var(--accent)] hover:underline">{quote.email}</a>
        </div>
        <span className={`status-badge status-${quote.status} shrink-0`}>{statusLabels[quote.status] || quote.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-3">Project Description</h3>
            <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">{quote.description || "No description provided."}</p>
          </div>

          {/* Notes */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-3">Internal Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this quote..."
              rows={4}
              className="w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20 resize-none"
            />
            <div className="flex justify-end mt-3">
              <button onClick={saveNotes} disabled={saving}
                className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[#0a0a0a] font-semibold text-xs tracking-wider uppercase hover:bg-white transition-colors disabled:opacity-40">
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Details</h3>
            <div className="space-y-3">
              {quote.project_types?.length ? (
                <div>
                  <div className="text-xs text-[var(--text-dim)] mb-1.5">Project Type</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {quote.project_types.map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-white/[0.04] border border-[var(--border)] rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-dim)]">Budget</span>
                <span>{quote.budget || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-dim)]">Timeline</span>
                <span>{quote.timeline || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-dim)]">Submitted</span>
                <span>{new Date(quote.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-dim)]">Last Updated</span>
                <span>{new Date(quote.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-dim)] mb-1.5 block">Update Status</label>
                <select value={quote.status} onChange={(e) => updateStatus(e.target.value)}
                  className="w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[#111]">{label}</option>
                  ))}
                </select>
              </div>
              <a href={`mailto:${quote.email}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent)]/5 transition-colors">
                <i className="fa-solid fa-envelope" /> Send Email
              </a>
              <button onClick={deleteQuote}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/5 transition-colors">
                <i className="fa-solid fa-trash" /> Delete Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
