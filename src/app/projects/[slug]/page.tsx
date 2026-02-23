"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { projects } from "@/data/projects";
import { useState } from "react";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);
  const [lightbox, setLightbox] = useState<number | null>(null);

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

  return (
    <>
      {/* Back nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 py-5 flex justify-between items-center backdrop-blur-xl bg-[#0a0a0a]/70 border-b border-[var(--border)]">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-[var(--text-dim)] text-sm hover:text-[var(--accent)] transition-colors">
          <i className="fa-solid fa-arrow-left" /> Back to Projects
        </Link>
        <span className="font-display text-[1.2rem] tracking-[3px] text-[var(--accent)]">{project.shortName.toUpperCase()}</span>
      </nav>

      {/* Hero */}
      <section className="pt-24 relative">
        {project.cover ? (
          <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
            <Image
              src={project.cover}
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
          <p className="text-[var(--text-dim)] text-lg font-light leading-relaxed max-w-[700px]">{project.desc}</p>
        </div>
      </section>

      {/* Tech Stack + Links */}
      <section className="px-7 md:px-[60px] py-10 border-b border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
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
        </div>
      </section>

      {/* Features + Tags */}
      <section className="px-7 md:px-[60px] py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
        </div>
      </section>

      {/* Screenshots Bento Grid */}
      {project.screenshots.length > 0 && (
        <section className="py-12 border-t border-[var(--border)]">
          <div className="px-7 md:px-[60px] mb-8">
            <div className="inline-flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--accent3)]/10 flex items-center justify-center">
                <i className="fa-solid fa-images text-xs text-[var(--accent3)]" />
              </span>
              <span className="text-xs font-semibold tracking-[2px] uppercase text-[var(--accent3)]">Screenshots</span>
            </div>
          </div>

          <div className="px-7 md:px-[60px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[200px] gap-3">
            {project.screenshots.map((s, i) => {
              const sizeClass = s.size === "wide"
                ? "md:col-span-2 md:row-span-2"
                : s.size === "tall"
                ? "row-span-2"
                : "";

              return (
                <button
                  key={s.src}
                  onClick={() => setLightbox(i)}
                  className={`group relative rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer bg-[var(--bg-card)] ${sizeClass}`}
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-sm text-white font-medium drop-shadow-lg">{s.alt}</span>
                    <i className="fa-solid fa-expand text-white/70 text-sm drop-shadow-lg" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* No screenshots placeholder */}
      {project.screenshots.length === 0 && (
        <section className="px-7 md:px-[60px] py-12 border-t border-[var(--border)]">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
            <i className="fa-solid fa-camera text-3xl text-[var(--text-dim)]/30 mb-4" />
            <p className="text-[var(--text-dim)] text-sm">Screenshots coming soon.</p>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>

          {/* Prev */}
          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
          )}

          {/* Next */}
          {lightbox < project.screenshots.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          )}

          <div className="max-w-[90vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={project.screenshots[lightbox].src}
              alt={project.screenshots[lightbox].alt}
              width={1400}
              height={900}
              className="w-auto h-auto max-w-full max-h-[85vh] rounded-lg object-contain"
            />
            <div className="text-center mt-3 text-sm text-white/60">
              {project.screenshots[lightbox].alt} — {lightbox + 1} / {project.screenshots.length}
            </div>
          </div>
        </div>
      )}

      {/* Footer spacer */}
      <div className="h-20" />
    </>
  );
}
