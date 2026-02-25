"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Currency, ProjectLink } from "@/types/database";
import DatePicker from "@/components/DatePicker";

const statusOptions = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const currencies: Currency[] = ["EGP", "USD", "EUR"];

export default function NewProject() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Basic info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("planning");

  // Financial
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState<Currency>("EGP");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Portfolio display
  const [published, setPublished] = useState(false);
  const [displayOrder, setDisplayOrder] = useState("0");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [tech, setTech] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [links, setLinks] = useState<ProjectLink[]>([]);

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [name, slug]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const addTech = () => {
    if (techInput.trim() && !tech.includes(techInput.trim())) {
      setTech([...tech, techInput.trim()]);
      setTechInput("");
    }
  };

  const addLink = () => {
    setLinks([...links, { href: "", icon: "fa-globe", label: "" }]);
  };

  const updateLink = (i: number, field: keyof ProjectLink, value: string) => {
    const updated = [...links];
    updated[i] = { ...updated[i], [field]: value };
    setLinks(updated);
  };

  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!name || !slug) return;
    setSaving(true);
    const { data, error } = await supabase.from("projects").insert({
      name,
      slug,
      client: client || null,
      description: description || null,
      status,
      budget: budget ? parseFloat(budget) : null,
      currency,
      paid: 0,
      start_date: startDate || null,
      end_date: endDate || null,
      tags,
      features,
      tech,
      links: links.filter((l) => l.href && l.label),
      cover_image: coverImage || null,
      published,
      display_order: parseInt(displayOrder) || 0,
    } as never).select("id").single() as { data: { id: string } | null; error: { message: string } | null };
    setSaving(false);
    if (data) router.push(`/admin/projects/${data.id}`);
    else if (error) alert(error.message);
  };

  const inputClass = "w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20";
  const labelClass = "text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block";

  return (
    <div>
      <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors mb-6">
        <i className="fa-solid fa-arrow-left" /> Back to Projects
      </Link>

      <h1 className="font-display text-4xl tracking-wide mb-8">NEW PROJECT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Basic Info</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Project Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CLASH — TOURNAMENT MANAGEMENT SYSTEM" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Slug</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. clash" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Client</label>
                  <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name (optional)" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description..." rows={4} className={inputClass + " resize-none"} />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Tags</h3>
            <div className="flex gap-2 mb-3">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag..." className={inputClass} />
              <button type="button" onClick={addTag} className="px-4 py-2.5 bg-white/[0.04] border border-[var(--border)] rounded-lg text-sm text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors shrink-0">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-[var(--border)] rounded-full text-xs">
                    {t}
                    <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="text-[var(--text-dim)] hover:text-red-400 transition-colors">
                      <i className="fa-solid fa-xmark text-[0.6rem]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Features</h3>
            <div className="flex gap-2 mb-3">
              <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                placeholder="Add a feature..." className={inputClass} />
              <button type="button" onClick={addFeature} className="px-4 py-2.5 bg-white/[0.04] border border-[var(--border)] rounded-lg text-sm text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors shrink-0">Add</button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-col gap-2">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
                    <span className="w-[18px] h-[18px] rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[0.6rem] text-[var(--accent)] shrink-0">&#10003;</span>
                    <span className="flex-1">{f}</span>
                    <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="text-[var(--text-dim)] hover:text-red-400 transition-colors">
                      <i className="fa-solid fa-xmark text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold">Links</h3>
              <button type="button" onClick={addLink} className="text-xs text-[var(--accent)] hover:underline">+ Add Link</button>
            </div>
            {links.length > 0 && (
              <div className="space-y-3">
                {links.map((l, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input value={l.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="Label" className={inputClass + " w-28"} />
                    <input value={l.href} onChange={(e) => updateLink(i, "href", e.target.value)} placeholder="https://..." className={inputClass + " flex-1"} />
                    <input value={l.icon} onChange={(e) => updateLink(i, "icon", e.target.value)} placeholder="fa-globe" className={inputClass + " w-28"} />
                    <button type="button" onClick={() => removeLink(i)} className="mt-2.5 text-[var(--text-dim)] hover:text-red-400 transition-colors shrink-0">
                      <i className="fa-solid fa-trash text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {links.length === 0 && <p className="text-sm text-[var(--text-dim)]">No links added yet.</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Dates */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Status & Dates</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                  {statusOptions.map((s) => <option key={s.value} value={s.value} className="bg-[#111]">{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <DatePicker value={startDate} onChange={setStartDate} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <DatePicker value={endDate} onChange={setEndDate} />
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Financial</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Budget</label>
                <div className="flex gap-2">
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00"
                    className="flex-1 bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20" />
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-20 bg-white/[0.04] border border-[var(--border)] rounded-lg px-2 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors text-center">
                    {currencies.map((c) => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Display */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Portfolio Display</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text)]">Published</span>
                <div className={`relative w-11 h-6 rounded-full transition-colors ${published ? "bg-[var(--accent)]" : "bg-white/10"}`}
                  onClick={() => setPublished(!published)}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${published ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </div>
              </label>
              <div>
                <label className={labelClass}>Display Order</label>
                <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cover Image URL</label>
                <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/images/project-cover.jpg" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Tech Stack</h3>
            <div className="flex gap-2 mb-3">
              <input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                placeholder="e.g. React" className={inputClass} />
              <button type="button" onClick={addTech} className="px-4 py-2.5 bg-white/[0.04] border border-[var(--border)] rounded-lg text-sm text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors shrink-0">Add</button>
            </div>
            {tech.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tech.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-[var(--border)] rounded-full text-xs">
                    {t}
                    <button type="button" onClick={() => setTech(tech.filter((_, idx) => idx !== i))} className="text-[var(--text-dim)] hover:text-red-400 transition-colors">
                      <i className="fa-solid fa-xmark text-[0.6rem]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!name || !slug || saving}
            className="w-full py-3 rounded-lg bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-wider uppercase hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? (<span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin text-xs" /> Creating...</span>) : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
