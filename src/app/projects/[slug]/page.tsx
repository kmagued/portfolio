"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import type { Project } from "@/types/database";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()
      .then(({ data }) => {
        if (data) setProject(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--accent)]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-5xl mb-4">404</h1>
          <p className="text-[var(--text-dim)] mb-8">Project not found.</p>
          <Link href="/#projects" className="px-6 py-3 rounded-full bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-[1.5px] uppercase hover:bg-white transition-all">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const shortName = project.name.split("—")[0]?.trim() || project.slug.toUpperCase();

  return (
    <>
      {/* Back nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 py-5 flex justify-between items-center backdrop-blur-xl bg-[#0a0a0a]/70 border-b border-[var(--border)]">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-[var(--text-dim)] text-sm hover:text-[var(--accent)] transition-colors">
          <i className="fa-solid fa-arrow-left" /> Back to Projects
        </Link>
        <span className="font-display text-[1.2rem] tracking-[3px] text-[var(--accent)]">{shortName}</span>
      </nav>

      {/* Hero */}
      <section className="pt-24 relative">
        {project.cover_image ? (
          <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
            <Image
              src={project.cover_image}
              alt={project.name}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-[200px] md:h-[300px] bg-gradient-to-br from-[#111] to-[#1a1a1a]" />
        )}

        <div className="relative z-10 px-7 md:px-[60px] -mt-24">
          <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] tracking-wide leading-tight mb-4">{project.name}</h1>
          <p className="text-[var(--text-dim)] text-lg font-light leading-relaxed max-w-[700px]">{project.description}</p>
        </div>
      </section>

      {/* Tech Stack + Links */}
      <section className="px-7 md:px-[60px] py-10 border-b border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {project.tech?.length > 0 && (
            <div className="flex-1">
              <div className="text-[0.65rem] text-[var(--text-dim)] tracking-[2px] uppercase font-semibold mb-3">Tech Stack</div>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="px-4 py-2 bg-white/[0.04] border border-[var(--border)] rounded-full text-xs font-medium text-[var(--text)] tracking-wide">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.links?.length > 0 && (
            <div>
              <div className="text-[0.65rem] text-[var(--text-dim)] tracking-[2px] uppercase font-semibold mb-3">Links</div>
              <div className="flex flex-wrap gap-2">
                {project.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)]/[0.04] border border-[var(--accent)]/[0.12] rounded-full text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(232,255,71,0.1)] transition-all">
                    <i className={`${l.icon.includes("fa-brands") ? "" : "fa-solid "}${l.icon} text-[0.7rem]`} />{l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features + Tags */}
      <section className="px-7 md:px-[60px] py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {project.features?.length > 0 && (
            <div>
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <i className="fa-solid fa-check text-xs text-[var(--accent)]" />
                </span>
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[var(--accent)]">Features</span>
              </div>
              <div className="flex flex-col gap-3">
                {project.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-dim)]">
                    <span className="w-[18px] h-[18px] rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[0.6rem] text-[var(--accent)] shrink-0">&#10003;</span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.tags?.length > 0 && (
            <div>
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-full bg-[var(--accent2)]/10 flex items-center justify-center">
                  <i className="fa-solid fa-tags text-xs text-[var(--accent2)]" />
                </span>
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[var(--accent2)]">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span key={t} className="px-3.5 py-1.5 bg-white/[0.04] border border-[var(--border)] rounded-full text-[0.72rem] font-medium text-[var(--text-dim)]">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Screenshots placeholder */}
      <section className="px-7 md:px-[60px] py-12 border-t border-[var(--border)]">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <i className="fa-solid fa-camera text-3xl text-[var(--text-dim)]/30 mb-4" />
          <p className="text-[var(--text-dim)] text-sm">Screenshots coming soon.</p>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-20" />
    </>
  );
}
