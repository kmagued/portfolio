"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CurrencyProvider, useCurrency, currencies } from "@/lib/currency-context";

const navLinks = [
  { href: "/admin", label: "Overview", icon: "fa-chart-pie" },
  { href: "/admin/quotes", label: "Quotes", icon: "fa-file-lines" },
  { href: "/admin/projects", label: "Projects", icon: "fa-folder" },
  { href: "/admin/finances", label: "Finances", icon: "fa-wallet" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--accent)]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          <div className="text-center mb-8">
            <span className="font-display text-2xl tracking-[3px] text-[var(--accent)]">SPORT × CODE</span>
            <h2 className="font-display text-3xl mt-3 tracking-wide">ADMIN LOGIN</h2>
          </div>
          {authError && <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{authError}</div>}
          <div className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
              className="w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && signIn()}
              className="w-full bg-white/[0.04] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors placeholder:text-white/20" />
            <button onClick={signIn} className="w-full py-3 rounded-full bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-wider uppercase hover:bg-white transition-colors">
              Sign In
            </button>
          </div>
          <a href="/" className="block text-center mt-6 text-xs text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
            <i className="fa-solid fa-arrow-left mr-1" /> Back to Portfolio
          </a>
        </div>
      </div>
    );
  }

  return (
    <CurrencyProvider>
    <div className="min-h-screen flex">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#111] border-b border-[var(--border)] md:hidden">
        <a href="/" className="font-display text-lg tracking-[3px] text-[var(--accent)]">SPORT × CODE</a>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar"
          className="w-10 h-10 flex flex-col items-center justify-center gap-[5px]">
          <span className={`w-5 h-[1.5px] bg-[var(--text)] transition-all duration-300 ${sidebarOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`w-5 h-[1.5px] bg-[var(--text)] transition-all duration-300 ${sidebarOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-[1.5px] bg-[var(--text)] transition-all duration-300 ${sidebarOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[51] md:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — desktop: sticky left, mobile: slide from right */}
      <aside className={`fixed md:sticky top-0 right-0 md:left-0 md:right-auto h-screen w-56 bg-[#111] border-l md:border-l-0 md:border-r border-[var(--border)] p-5 flex flex-col shrink-0 z-[52] transition-transform duration-300 ease-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <a href="/" className="font-display text-lg tracking-[3px] text-[var(--accent)] mb-8 hidden md:block">SPORT × CODE</a>
        <div className="mt-14 md:mt-0 text-[0.65rem] text-[var(--text-dim)] uppercase tracking-[2px] font-semibold mb-3">Dashboard</div>
        <nav className="flex flex-col gap-1 flex-1">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${active ? "text-[var(--accent)] bg-[var(--accent)]/5" : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-white/[0.02]"}`}>
                <i className={`fa-solid ${l.icon} w-4 text-center`} />{l.label}
              </Link>
            );
          })}
        </nav>
        <CurrencySelector />
        <button onClick={signOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-dim)] hover:text-red-400 transition-colors">
          <i className="fa-solid fa-right-from-bracket w-4 text-center" /> Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 pt-20 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
    </CurrencyProvider>
  );
}

function CurrencySelector() {
  const { baseCurrency, setBaseCurrency } = useCurrency();
  return (
    <div className="mb-3 px-1">
      <div className="text-[0.6rem] text-[var(--text-dim)] uppercase tracking-[2px] font-semibold mb-2">Currency</div>
      <div className="flex gap-1">
        {currencies.map((c) => (
          <button key={c} onClick={() => setBaseCurrency(c)}
            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${baseCurrency === c ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"}`}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
