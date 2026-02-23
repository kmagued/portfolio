"use client";

import { useState } from "react";

const PROJECT_TYPES = [
  { value: "Tournament System", icon: "fa-trophy" },
  { value: "Training Platform", icon: "fa-dumbbell" },
  { value: "Sports Analytics", icon: "fa-chart-line" },
  { value: "Mobile App", icon: "fa-mobile-screen" },
  { value: "Web Application", icon: "fa-globe" },
  { value: "Other", icon: "fa-lightbulb" },
];

const BUDGETS = ["< 10K EGP", "10K – 50K EGP", "50K – 150K EGP", "150K+ EGP", "Let's discuss"];
const TIMELINES = ["< 1 month", "1–3 months", "3–6 months", "Flexible"];

export default function QuoteForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    project_types: [] as string[],
    budget: "",
    timeline: "",
    description: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const toggleType = (type: string) => {
    setForm((f) => ({
      ...f,
      project_types: f.project_types.includes(type)
        ? f.project_types.filter((t) => t !== type)
        : [...f.project_types, type],
    }));
  };

  const submit = async () => {
    if (!form.name || !form.email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", email: "", project_types: [], budget: "", timeline: "", description: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4"><i className="fa-solid fa-circle-check" style={{ color: "var(--accent)" }} /></div>
        <h3 className="font-display text-3xl tracking-wide mb-2">QUOTE REQUEST SENT</h3>
        <p className="text-[var(--text-dim)] text-sm">Thanks! I&apos;ll get back to you within 24 hours.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 px-6 py-2 rounded-full border border-[var(--border)] text-sm text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-9">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[3px] uppercase text-[var(--accent)] mb-4">
          <span className="w-[30px] h-[2px] bg-[var(--accent)]" />
          Request a Quote
        </div>
        <h3 className="font-display text-3xl tracking-wide mb-2">TELL ME ABOUT YOUR PROJECT</h3>
        <p className="text-sm text-[var(--text-dim)] font-light">Fill in the details below and I&apos;ll get back to you with a tailored quote.</p>
      </div>

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-xs font-semibold tracking-[1.5px] uppercase text-[var(--text-dim)] mb-2">Your Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="John Doe"
            className="w-full bg-white/[0.04] border border-[var(--border)] rounded-[10px] px-4 py-3.5 text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(232,255,71,0.08)] transition-all placeholder:text-white/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[1.5px] uppercase text-[var(--text-dim)] mb-2">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="john@example.com"
            className="w-full bg-white/[0.04] border border-[var(--border)] rounded-[10px] px-4 py-3.5 text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(232,255,71,0.08)] transition-all placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Project Types */}
      <div className="mb-5">
        <label className="block text-xs font-semibold tracking-[1.5px] uppercase text-[var(--text-dim)] mb-2">Project Type</label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleType(t.value)}
              className={`px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                form.project_types.includes(t.value)
                  ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                  : "bg-white/[0.03] border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]/30 hover:text-[var(--text)]"
              }`}
            >
              <i className={`fa-solid ${t.icon} mr-1.5 text-[0.7rem]`} /> {t.value}
            </button>
          ))}
        </div>
      </div>

      {/* Budget & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-xs font-semibold tracking-[1.5px] uppercase text-[var(--text-dim)] mb-2">Estimated Budget</label>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <button
                key={b}
                onClick={() => setForm((f) => ({ ...f, budget: f.budget === b ? "" : b }))}
                className={`px-3 py-2 rounded-full border text-xs font-medium transition-all ${
                  form.budget === b
                    ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                    : "bg-white/[0.03] border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]/30 hover:text-[var(--text)]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[1.5px] uppercase text-[var(--text-dim)] mb-2">Timeline</label>
          <div className="flex flex-wrap gap-2">
            {TIMELINES.map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, timeline: f.timeline === t ? "" : t }))}
                className={`px-3 py-2 rounded-full border text-xs font-medium transition-all ${
                  form.timeline === t
                    ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                    : "bg-white/[0.03] border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]/30 hover:text-[var(--text)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-xs font-semibold tracking-[1.5px] uppercase text-[var(--text-dim)] mb-2">Project Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          placeholder="Tell me about your project, goals, and any specific features you have in mind..."
          className="w-full bg-white/[0.04] border border-[var(--border)] rounded-[10px] px-4 py-3.5 text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(232,255,71,0.08)] transition-all resize-y min-h-[100px] placeholder:text-white/20"
        />
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={status === "loading" || !form.name || !form.email}
        className="w-full py-4 rounded-full bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-[2px] uppercase hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,255,71,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <><i className="fa-solid fa-spinner fa-spin mr-2" /> Sending...</>
        ) : status === "error" ? (
          "Failed — Try Again"
        ) : (
          <>Send Quote Request <i className="fa-solid fa-arrow-right ml-2" /></>
        )}
      </button>
    </div>
  );
}
