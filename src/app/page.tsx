import Image from "next/image";
import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";
import ScrollReveal from "@/components/ScrollReveal";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <>
      <ScrollReveal />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 py-5 flex justify-between items-center backdrop-blur-xl bg-[#0a0a0a]/70 border-b border-[var(--border)]">
        <a href="#" className="font-display text-[1.6rem] tracking-[3px] text-[var(--accent)]">SPORT × CODE</a>
        <div className="hidden md:flex gap-8">
          {["About", "Projects", "Stack", "Contact"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-[var(--text-dim)] text-xs font-medium tracking-[1.5px] uppercase hover:text-[var(--text)] transition-colors relative group">
              {l}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--accent)] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen relative overflow-hidden">
        {/* Background: Name watermark */}
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none overflow-hidden">
          <span className="font-display text-[18vw] md:text-[16vw] leading-[0.85] text-transparent [-webkit-text-stroke:1px_rgba(232,255,71,0.05)] whitespace-nowrap">KHALED</span>
          <span className="font-display text-[18vw] md:text-[16vw] leading-[0.85] text-transparent [-webkit-text-stroke:1px_rgba(232,255,71,0.05)] whitespace-nowrap">MAGUED</span>
        </div>

        {/* Background: Accent glow */}
        <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/[0.03] rounded-full blur-[120px] pointer-events-none" />

        {/* Background: Floating sport icons */}
        {["fa-futbol", "fa-volleyball", "fa-table-tennis-paddle-ball"].map((icon, i) => (
          <div key={icon} className="absolute opacity-[0.06] text-[2rem] text-[var(--accent)]" style={{ top: `${25 + i * 20}%`, left: `${5 + i * 3}%`, animation: `floatSlow 8s ease-in-out infinite ${i * 2.5}s` }}>
            <i className={`fa-solid ${icon}`} />
          </div>
        ))}

        {/* Main content grid */}
        <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 px-7 md:px-[60px] pt-32 md:pt-36 pb-16 items-center">

          {/* LEFT: Text content */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[3px] uppercase text-[var(--accent)] mb-6 opacity-0 animate-slideUp" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
              <span className="w-10 h-[2px] bg-[var(--accent)]" /> Software Developer × Sports Enthusiast
            </div>

            <h1 className="font-display text-[3.8rem] md:text-[clamp(5rem,8vw,8rem)] leading-[0.9] tracking-tight mb-4 opacity-0 animate-slideUp" style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}>
              KHALED<br />
              <span className="text-[var(--accent)] relative inline-block">MAGUED<span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[var(--accent)] opacity-25 -skew-x-12" /></span>
            </h1>

            <h2 className="font-display text-[1.4rem] md:text-[clamp(1.5rem,3vw,2.5rem)] tracking-[3px] text-[var(--text-dim)] mb-7 opacity-0 animate-slideUp" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
              BUILDING THE FUTURE OF<br className="hidden md:block" /> SPORT TECHNOLOGY
            </h2>

            <p className="max-w-[480px] text-base md:text-lg text-[var(--text-dim)] font-light leading-relaxed mb-10 opacity-0 animate-slideUp" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
              Crafting digital platforms where the competitive spirit meets clean code. From tournament systems to fantasy leagues — turning athletic passion into powerful software.
            </p>

            <div className="flex flex-wrap gap-4 mb-12 opacity-0 animate-slideUp" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
              <a href="#projects" className="px-8 py-3.5 rounded-full bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-[1.5px] uppercase hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,255,71,0.2)] transition-all">
                View Projects <i className="fa-solid fa-arrow-right ml-2" />
              </a>
              <a href="#contact" className="px-8 py-3.5 rounded-full border border-[var(--border)] text-[var(--text)] font-semibold text-sm tracking-[1.5px] uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] hover:-translate-y-0.5 transition-all">
                Get In Touch
              </a>
            </div>

            <div className="flex gap-10 md:gap-12 opacity-0 animate-slideUp" style={{ animationDelay: "0.85s", animationFillMode: "forwards" }}>
              {[{ n: "3+", l: "Sport Projects" }, { n: "100%", l: "Sport Focused" }, { n: "∞", l: "Passion" }].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-4xl md:text-5xl text-[var(--accent)] leading-none">{s.n}</div>
                  <div className="text-[0.65rem] md:text-xs text-[var(--text-dim)] tracking-[2px] uppercase mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Photo composition */}
          <div className="flex items-center justify-center order-1 lg:order-2 relative opacity-0 animate-slideUp" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <div className="relative w-[320px] h-[420px] md:w-[420px] md:h-[540px] lg:w-[480px] lg:h-[600px]">
              {/* Decorative rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full border border-[var(--accent)]/[0.08] animate-[spinSlow_30s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-full border border-dashed border-[var(--border)]/50 animate-[spinSlowReverse_45s_linear_infinite]" />

              {/* Profile photo - center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[160px] h-[160px] md:w-[200px] md:h-[200px]">
                <Image src="/assets/profile.jpg" alt="Khaled Magued" width={400} height={400} className="w-full h-full object-cover object-top rounded-full border-[3px] border-[var(--accent)] shadow-[0_0_60px_rgba(232,255,71,0.15),0_20px_60px_rgba(0,0,0,0.5)]" priority />
                <div className="absolute -inset-2.5 rounded-full border border-[var(--accent)]/20 animate-[spinSlow_20s_linear_infinite] border-t-transparent border-l-transparent" />
              </div>

              {/* Volleyball - top left */}
              <div className="absolute top-0 left-0 w-[130px] h-[160px] md:w-[155px] md:h-[195px] rounded-2xl overflow-hidden border border-[var(--border)] shadow-[0_15px_50px_rgba(0,0,0,0.5)] -rotate-6 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-[var(--accent)]/30 transition-all duration-500 group z-10" style={{ animation: "floatSlow 10s ease-in-out infinite 0s" }}>
                <Image src="/assets/volleyball.jpg" alt="Volleyball" width={310} height={390} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-volleyball text-[0.65rem] text-[var(--accent)]" />
                  <span className="font-display text-sm tracking-wider text-white">VOLLEYBALL</span>
                </div>
              </div>

              {/* Padel - top right */}
              <div className="absolute top-[5%] right-0 w-[120px] h-[175px] md:w-[145px] md:h-[210px] rounded-2xl overflow-hidden border border-[var(--border)] shadow-[0_15px_50px_rgba(0,0,0,0.5)] rotate-3 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-[var(--accent)]/30 transition-all duration-500 group z-10" style={{ animation: "floatSlow 10s ease-in-out infinite 1.5s" }}>
                <Image src="/assets/padel.jpg" alt="Padel" width={290} height={420} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-table-tennis-paddle-ball text-[0.65rem] text-[var(--accent)]" />
                  <span className="font-display text-sm tracking-wider text-white">PADEL</span>
                </div>
              </div>

              {/* Football - bottom center */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150px] h-[170px] md:w-[180px] md:h-[200px] rounded-2xl overflow-hidden border border-[var(--border)] shadow-[0_15px_50px_rgba(0,0,0,0.5)] rotate-1 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-[var(--accent)]/30 transition-all duration-500 group z-10" style={{ animation: "floatSlow 10s ease-in-out infinite 3s" }}>
                <Image src="/assets/football.jpg" alt="Football" width={360} height={400} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-futbol text-[0.65rem] text-[var(--accent)]" />
                  <span className="font-display text-sm tracking-wider text-white">FOOTBALL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10" />
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

      {/* ABOUT */}
      <section id="about" className="py-24 px-7 md:px-[60px]">
        <div className="reveal">
          <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[3px] uppercase text-[var(--accent)] mb-4">
            <span className="w-[30px] h-[2px] bg-[var(--accent)]" /> About Me
          </div>
          <h2 className="font-display text-[clamp(2.8rem,5vw,4.5rem)] tracking-wide mb-14">WHERE CODE<br />MEETS THE COURT</h2>
        </div>

        {/* Story */}
        <div className="reveal bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 md:p-10 relative overflow-hidden group hover:border-[var(--accent)]/20 transition-all mb-5">
          <div className="absolute top-0 left-0 w-24 h-24 bg-[var(--accent)]/[0.03] rounded-br-[60px]" />
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <i className="fa-solid fa-user text-xs text-[var(--accent)]" />
              </span>
              <span className="text-xs font-semibold tracking-[2px] uppercase text-[var(--accent)]">My Story</span>
            </div>

            <p className="text-[var(--text)] text-lg md:text-xl font-light leading-relaxed mb-4">
              I&apos;ve spent most of my life on a court.
            </p>
            <p className="text-[var(--text-dim)] text-base font-light leading-relaxed mb-4">
              I played professional volleyball for 12 years, trained in squash, got into padel in 2018, and organized weekly football games during university. Those games didn&apos;t just stay games — they turned into an idea: what if amateur players could experience sports the way professionals do?
            </p>
            <p className="text-[var(--text-dim)] text-base font-light leading-relaxed mb-4">
              In 2023, my team and I built and launched a fantasy sports app that went live on iOS and Android and partnered with amateur leagues after presenting at a football summit in Cairo.
            </p>
            <p className="text-[var(--text-dim)] text-base font-light leading-relaxed mb-4">
              That momentum led to something bigger — <span className="text-[var(--accent)]">Clash</span>. What started as a simple website to display match schedules evolved into a full tournament management and live scoring platform. From automated brackets and referee portals to live scores, rankings, and multi-sport support, the platform now powers large-scale international tournaments seamlessly.
            </p>
            <p className="text-[var(--text)] text-lg md:text-xl font-light leading-relaxed mb-1">
              I don&apos;t just build software.
            </p>
            <p className="text-[var(--text)] text-lg md:text-xl font-light leading-relaxed mb-4">
              I build <span className="text-[var(--accent)]">sports experiences</span>.
            </p>
            <p className="text-[var(--text-dim)] text-base font-light leading-relaxed">
              My first passion was sports. Now I combine it with tech — and that&apos;s where I do my best work.
            </p>

          </div>
        </div>

        {/* Quotes & Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Quotes */}
          <div className="reveal bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 md:p-10 relative overflow-hidden group hover:border-[var(--accent)]/20 transition-all">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            <div className="font-display text-[5rem] leading-none text-[var(--accent)]/[0.08] absolute top-4 right-8 select-none">&ldquo;</div>

            <div className="relative z-10 flex flex-col gap-8">
              <div>
                <p className="font-display text-2xl md:text-3xl text-[var(--text)] leading-tight tracking-wide mb-2">CONSISTENCY IS KEY.</p>
                <p className="text-sm text-[var(--text-dim)] font-light leading-relaxed">Show up every day. Small, steady effort beats occasional bursts of brilliance — in sports and in code.</p>
              </div>

              <div>
                <p className="font-display text-2xl md:text-3xl text-[var(--text)] leading-tight tracking-wide mb-2">TAKE THE STAIRS,<br />NOT THE ELEVATOR.</p>
                <p className="text-sm text-[var(--text-dim)] font-light leading-relaxed">Choose the harder path that builds real skill. There are no shortcuts to mastery — earn every step.</p>
              </div>
            </div>
          </div>

          {/* Philosophy */}
          <div className="reveal bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 md:p-10 relative overflow-hidden hover:border-[var(--accent)]/20 transition-all group">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <i className="fa-solid fa-bolt text-xs text-[var(--accent)]" />
              </span>
              <span className="text-xs font-semibold tracking-[2px] uppercase text-[var(--accent)]">Philosophy</span>
            </div>

            <div className="flex flex-col gap-5">
              {[
                { icon: "fa-users", title: "TEAM PLAYER", desc: "Software built the same way the game is played — collaborating, adapting, and pushing for the win." },
                { icon: "fa-bullseye", title: "USER-FIRST", desc: "Every feature shipped has been shaped by real athletes and real tournament organizers." },
                { icon: "fa-repeat", title: "ITERATE FAST", desc: "Sports teach you to review, adjust, and come back stronger. The code follows the same cycle." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <i className={`fa-solid ${item.icon} text-xs text-[var(--accent)]`} />
                  </div>
                  <div>
                    <div className="font-display text-sm tracking-wider mb-0.5">{item.title}</div>
                    <div className="text-[0.7rem] text-[var(--text-dim)] leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

      {/* PROJECTS */}
      <section id="projects" className="py-24 px-7 md:px-[60px] bg-[#0e0e0e]">
        <div className="reveal">
          <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[3px] uppercase text-[var(--accent)] mb-4">
            <span className="w-[30px] h-[2px] bg-[var(--accent)]" /> Projects
          </div>
          <h2 className="font-display text-[clamp(2.8rem,5vw,4.5rem)] tracking-wide mb-14">BUILT TO COMPETE</h2>
        </div>

        <div className="flex flex-col gap-8">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} reversed={i % 2 === 1} />
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

      {/* SKILLS */}
      <section id="stack" className="py-24 px-7 md:px-[60px]">
        <div className="reveal">
          <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[3px] uppercase text-[var(--accent)] mb-4">
            <span className="w-[30px] h-[2px] bg-[var(--accent)]" /> Tech Stack
          </div>
          <h2 className="font-display text-[clamp(2.8rem,5vw,4.5rem)] tracking-wide mb-14">TOOLS OF THE TRADE</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: "fa-bolt", name: "FRONTEND", desc: "React, Next.js, TypeScript, Tailwind CSS, responsive & performance-first UIs" },
            { icon: "fa-gear", name: "BACKEND", desc: ".NET, Node.js, REST APIs, real-time systems, microservices architecture" },
            { icon: "fa-database", name: "DATA", desc: "PostgreSQL, SQL Server, Supabase, data modeling for sports analytics" },
            { icon: "fa-cloud", name: "DEVOPS", desc: "Kubernetes, Docker, CI/CD, monitoring & scaling for live tournament systems" },
          ].map((s) => (
            <div key={s.name} className="reveal bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 relative overflow-hidden hover:border-[var(--accent)]/20 hover:-translate-y-1 transition-all group">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="text-[1.4rem] text-[var(--accent)] mb-4"><i className={`fa-solid ${s.icon}`} /></div>
              <div className="font-display text-xl tracking-wide mb-2">{s.name}</div>
              <div className="text-xs text-[var(--text-dim)] leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

      {/* CONTACT */}
      <section id="contact" className="py-24 px-7 md:px-[60px] bg-[#0e0e0e] text-center">
        <div className="max-w-[700px] mx-auto reveal">
          <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[3px] uppercase text-[var(--accent)] mb-4 justify-center">
            <span className="w-[30px] h-[2px] bg-[var(--accent)]" /> Get In Touch
          </div>
          <h2 className="font-display text-[clamp(3rem,6vw,5rem)] leading-none mb-5">
            LET&apos;S BUILD SOMETHING<br /><span className="text-[var(--accent)]">GAME-CHANGING</span>
          </h2>
          <p className="text-[var(--text-dim)] font-light leading-relaxed mb-10">
            Got a sports tech idea? Looking for a developer who actually understands the game? Let&apos;s connect and build something athletes will love.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="#contact" className="px-10 py-4 rounded-full bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-[1.5px] uppercase hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,255,71,0.2)] transition-all">
              Request a Quote
            </a>
            <a href="https://github.com/kmagued" target="_blank" className="px-8 py-4 rounded-full border border-[var(--border)] text-[var(--text)] font-semibold text-sm tracking-[1.5px] uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] hover:-translate-y-0.5 transition-all">
              GitHub
            </a>
          </div>
        </div>

        {/* Quote Form */}
        <div className="max-w-[800px] mx-auto mt-20 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 md:p-12 text-left relative overflow-hidden reveal">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent3)]" />
          <QuoteForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-7 md:px-[60px] border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs text-[var(--text-dim)]">© 2025 Khaled Magued. Built with passion.</div>
        <div className="flex gap-6">
          <a href="https://github.com/kmagued" target="_blank" className="text-[var(--text-dim)] text-sm hover:text-[var(--accent)] transition-colors">GitHub</a>
          <a href="https://www.linkedin.com/in/khaled-magued/" target="_blank" className="text-[var(--text-dim)] text-sm hover:text-[var(--accent)] transition-colors">LinkedIn</a>
        </div>
      </footer>
    </>
  );
}

/* Project Card Component */
function ProjectCard({ project, reversed }: { project: typeof import("@/data/projects").projects[number]; reversed?: boolean }) {
  const { slug, number, name, desc, tags, features, links, cover } = project;

  return (
    <Link href={`/projects/${slug}`} className="block">
      <div className={`reveal grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--accent)] hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.4)] transition-all duration-500 cursor-pointer`}>
        <div className={`p-8 md:p-12 flex flex-col justify-center relative ${reversed ? "lg:order-2" : ""}`}>
          <div className="absolute top-5 right-8 font-display text-[5rem] text-[var(--accent)]/[0.08] leading-none">{number}</div>
          <h3 className="font-display text-[clamp(2.4rem,3.5vw,3.2rem)] tracking-wide leading-tight mb-3.5">{name}</h3>
          <p className="text-[var(--text-dim)] font-light leading-relaxed mb-7">{desc}</p>
          <div className="flex flex-wrap gap-2 mb-7">
            {tags.map((t) => (
              <span key={t} className="px-3.5 py-1 bg-white/[0.04] border border-[var(--border)] rounded-full text-[0.72rem] font-medium text-[var(--text-dim)]">{t}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 mb-6">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-dim)]">
                <span className="w-[18px] h-[18px] rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[0.6rem] text-[var(--accent)] shrink-0">&#10003;</span>{f}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5 pt-5 border-t border-[var(--border)]">
            {links.map((l) => (
              <span key={l.href} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)]/[0.04] border border-[var(--accent)]/[0.12] rounded-full text-xs font-medium text-[var(--accent)]">
                <i className={`${l.icon.includes("fa-brands") ? "" : "fa-solid "}${l.icon} text-[0.7rem]`} />{l.label}
              </span>
            ))}
          </div>
        </div>
        <div className={`relative overflow-hidden min-h-[320px] ${reversed ? "lg:order-1" : ""}`}>
          {cover ? (
            <Image src={cover} alt={name} fill className="object-cover object-top hover:scale-[1.03] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#1a1a1a] flex items-center justify-center">
              <span className="font-display text-[4rem] text-[var(--accent)]/[0.08]">{number}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/50 via-transparent to-transparent" />
        </div>
      </div>
    </Link>
  );
}

