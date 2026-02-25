"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project, Currency, ProjectLink } from "@/types/database";
import DatePicker from "@/components/DatePicker";

const statusOptions = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const currencies: Currency[] = ["EGP", "USD", "EUR"];

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("planning");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState<Currency>("EGP");
  const [paid, setPaid] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

  useEffect(() => {
    supabase.from("projects").select("*").eq("id", id).single().then(({ data }: { data: Project | null }) => {
      if (data) {
        setProject(data);
        setName(data.name);
        setSlug(data.slug || "");
        setClient(data.client || "");
        setDescription(data.description || "");
        setStatus(data.status);
        setBudget(data.budget ? String(data.budget) : "");
        setCurrency(data.currency || "EGP");
        setPaid(data.paid ? String(data.paid) : "0");
        setStartDate(data.start_date || "");
        setEndDate(data.end_date || "");
        setPublished(data.published || false);
        setDisplayOrder(String(data.display_order || 0));
        setCoverImage(data.cover_image || "");
        setTags(data.tags || []);
        setFeatures(data.features || []);
        setTech(data.tech || []);
        setLinks(data.links || []);
      }
      setLoading(false);
    });
  }, [id]);

  const addTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(""); } };
  const addFeature = () => { if (featureInput.trim()) { setFeatures([...features, featureInput.trim()]); setFeatureInput(""); } };
  const addTech = () => { if (techInput.trim() && !tech.includes(techInput.trim())) { setTech([...tech, techInput.trim()]); setTechInput(""); } };
  const addLink = () => setLinks([...links, { href: "", icon: "fa-globe", label: "" }]);
  const updateLink = (i: number, field: keyof ProjectLink, value: string) => {
    const updated = [...links]; updated[i] = { ...updated[i], [field]: value }; setLinks(updated);
  };
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!name || !slug) return;
    setSaving(true);
    await supabase.from("projects").update({
      name, slug, client: client || null, description: description || null, status,
      budget: budget ? parseFloat(budget) : null, currency,
      paid: paid ? parseFloat(paid) : 0,
      start_date: startDate || null, end_date: endDate || null,
      tags, features, tech,
      links: links.filter((l) => l.href && l.label),
      cover_image: coverImage || null, published,
      display_order: parseInt(displayOrder) || 0,
    } as never).eq("id", id);
    setSaving(false);
    setProject((prev) => prev ? { ...prev, name, slug, published } : prev);
    setToast("Changes saved successfully");
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    router.push("/admin/projects");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--accent)]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <div className="text-[var(--text-dim)] mb-4">Project not found.</div>
        <Link href="/admin/projects" className="text-[var(--accent)] hover:underline text-sm">Back to Projects</Link>
      </div>
    );
  }

  const inputClass = "w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20";
  const labelClass = "text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1.5 block";

  return (
    <div className="pb-20">
      <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors mb-6">
        <i className="fa-solid fa-arrow-left" /> Back to Projects
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-wide mb-1">{project.name}</h1>
          <div className="flex items-center gap-3 text-sm text-[var(--text-dim)]">
            <span>/{project.slug}</span>
            {project.published && <span className="inline-flex items-center gap-1 text-green-400"><i className="fa-solid fa-circle text-[0.4rem]" /> Published</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="admin-card">
            <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-4">Basic Info</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Project Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Slug</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Client</label>
                  <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass + " resize-y"} />
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
            {links.length > 0 ? (
              <div className="space-y-4">
                {links.map((l, i) => (
                  <div key={i} className="p-3 bg-white/[0.02] border border-[var(--border)] rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[0.6rem] text-[var(--text-dim)] uppercase tracking-wide mb-1 block">Label</label>
                        <input value={l.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="e.g. Website" className={inputClass} />
                      </div>
                      <div className="w-28">
                        <label className="text-[0.6rem] text-[var(--text-dim)] uppercase tracking-wide mb-1 block">Icon</label>
                        <input value={l.icon} onChange={(e) => updateLink(i, "icon", e.target.value)} placeholder="fa-globe" className={inputClass} />
                      </div>
                      <button type="button" onClick={() => removeLink(i)} className="mt-5 text-[var(--text-dim)] hover:text-red-400 transition-colors shrink-0">
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    </div>
                    <div>
                      <label className="text-[0.6rem] text-[var(--text-dim)] uppercase tracking-wide mb-1 block">URL</label>
                      <input value={l.href} onChange={(e) => updateLink(i, "href", e.target.value)} placeholder="https://..." className={inputClass} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-dim)]">No links added yet.</p>
            )}
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
              <div>
                <label className={labelClass}>Paid</label>
                <input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="0.00" className={inputClass} />
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

        </div>
      </div>

      {/* Fixed save bar */}
      <div className="fixed bottom-0 right-0 left-0 md:left-56 z-[100] px-6 md:px-8 py-4 bg-[#111]/95 backdrop-blur-sm border-t border-[var(--border)] flex items-center justify-between gap-4">
        <button onClick={handleDelete}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/5 transition-colors">
          <i className="fa-solid fa-trash text-xs" /> Delete
        </button>
        <button onClick={handleSave} disabled={!name || !slug || saving}
          className="px-8 py-2.5 rounded-lg bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-wider uppercase hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? (<span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin text-xs" /> Saving...</span>) : "Save Changes"}
        </button>
      </div>

      {/* Toast notification */}
      <div className={`fixed bottom-20 right-6 z-[300] flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/90 text-[#0a0a0a] text-sm font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-all duration-300 ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <i className="fa-solid fa-check-circle" />
        {toast}
      </div>
    </div>
  );
}
