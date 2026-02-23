"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Quote, Project, Expense, Income } from "@/types/database";

type Tab = "overview" | "quotes" | "projects" | "expenses";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) loadData();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData();
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    const [q, p, e, i] = await Promise.all([
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("income").select("*").order("date", { ascending: false }),
    ]);
    if (q.data) setQuotes(q.data);
    if (p.data) setProjects(p.data);
    if (e.data) setExpenses(e.data);
    if (i.data) setIncome(i.data);
  };

  const signIn = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    await supabase.from("quotes").update({ status } as never).eq("id", id);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-[var(--accent)]" />
      </div>
    );
  }

  // Login
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

  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const newQuotes = quotes.filter((q) => q.status === "new").length;
  const activeProjects = projects.filter((p) => p.status === "in_progress").length;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "fa-grid-2" },
    { key: "quotes", label: `Quotes (${newQuotes})`, icon: "fa-file-lines" },
    { key: "projects", label: "Projects", icon: "fa-folder" },
    { key: "expenses", label: "Finances", icon: "fa-wallet" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#111] border-r border-[var(--border)] p-5 flex flex-col shrink-0 sticky top-0 h-screen">
        <a href="/" className="font-display text-lg tracking-[3px] text-[var(--accent)] mb-8">SPORT × CODE</a>
        <div className="text-[0.65rem] text-[var(--text-dim)] uppercase tracking-[2px] font-semibold mb-3">Dashboard</div>
        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${tab === t.key ? "text-[var(--accent)] bg-[var(--accent)]/5" : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-white/[0.02]"}`}>
              <i className={`fa-solid ${t.icon} w-4 text-center`} />{t.label}
            </button>
          ))}
        </nav>
        <button onClick={signOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-dim)] hover:text-red-400 transition-colors">
          <i className="fa-solid fa-right-from-bracket w-4 text-center" /> Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        {tab === "overview" && (
          <div>
            <h1 className="font-display text-4xl tracking-wide mb-2">DASHBOARD</h1>
            <p className="text-sm text-[var(--text-dim)] mb-8">Welcome back, Khaled.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { l: "Total Income", v: `${totalIncome.toLocaleString()} EGP`, c: "green", icon: "fa-arrow-trend-up" },
                { l: "Total Expenses", v: `${totalExpenses.toLocaleString()} EGP`, c: "red", icon: "fa-arrow-trend-down" },
                { l: "New Quotes", v: String(newQuotes), c: "blue", icon: "fa-file-lines" },
                { l: "Active Projects", v: String(activeProjects), c: "purple", icon: "fa-folder-open" },
              ].map((s) => (
                <div key={s.l} className={`admin-stat ${s.c}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">{s.l}</div>
                      <div className="font-display text-3xl tracking-wide">{s.v}</div>
                    </div>
                    <i className={`fa-solid ${s.icon} text-xl text-[var(--text-dim)]/30`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent quotes */}
            <div className="admin-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-xl tracking-wide">RECENT QUOTES</h3>
                <button onClick={() => setTab("quotes")} className="text-xs text-[var(--accent)] hover:underline">View all</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Project Type</th><th>Budget</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {quotes.slice(0, 5).map((q) => (
                    <tr key={q.id}>
                      <td className="font-medium">{q.name}</td>
                      <td className="text-[var(--text-dim)]">{q.project_types?.join(", ") || "—"}</td>
                      <td className="text-[var(--text-dim)]">{q.budget || "—"}</td>
                      <td><span className={`status-badge status-${q.status}`}>{q.status}</span></td>
                      <td className="text-[var(--text-dim)] text-xs">{new Date(q.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {quotes.length === 0 && <tr><td colSpan={5} className="text-center text-[var(--text-dim)] py-8">No quotes yet. They&apos;ll appear here when someone submits the form.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "quotes" && (
          <div>
            <h1 className="font-display text-4xl tracking-wide mb-2">QUOTES</h1>
            <p className="text-sm text-[var(--text-dim)] mb-8">Manage incoming quote requests from your portfolio.</p>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Budget</th><th>Timeline</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id}>
                      <td className="font-medium">{q.name}</td>
                      <td><a href={`mailto:${q.email}`} className="text-[var(--accent)] hover:underline">{q.email}</a></td>
                      <td className="text-[var(--text-dim)] text-xs">{q.project_types?.join(", ") || "—"}</td>
                      <td className="text-[var(--text-dim)]">{q.budget || "—"}</td>
                      <td className="text-[var(--text-dim)]">{q.timeline || "—"}</td>
                      <td><span className={`status-badge status-${q.status}`}>{q.status}</span></td>
                      <td>
                        <select value={q.status} onChange={(e) => updateQuoteStatus(q.id, e.target.value)}
                          className="bg-white/[0.04] border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-[var(--text)] outline-none">
                          {["new", "contacted", "in_progress", "accepted", "declined", "completed"].map((s) => (
                            <option key={s} value={s} className="bg-[#111]">{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && <tr><td colSpan={7} className="text-center text-[var(--text-dim)] py-8">No quotes yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div>
            <h1 className="font-display text-4xl tracking-wide mb-2">PROJECTS</h1>
            <p className="text-sm text-[var(--text-dim)] mb-8">Track active and completed projects.</p>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Project</th><th>Client</th><th>Budget</th><th>Paid</th><th>Status</th><th>Dates</th></tr></thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.name}</td>
                      <td className="text-[var(--text-dim)]">{p.client || "—"}</td>
                      <td className="text-[var(--text-dim)]">{p.budget ? `${Number(p.budget).toLocaleString()} EGP` : "—"}</td>
                      <td className="text-[var(--accent)]">{p.paid ? `${Number(p.paid).toLocaleString()} EGP` : "0"}</td>
                      <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                      <td className="text-[var(--text-dim)] text-xs">{p.start_date || "—"}{p.end_date ? ` → ${p.end_date}` : ""}</td>
                    </tr>
                  ))}
                  {projects.length === 0 && <tr><td colSpan={6} className="text-center text-[var(--text-dim)] py-8">No projects yet. Add projects via Supabase.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "expenses" && (
          <div>
            <h1 className="font-display text-4xl tracking-wide mb-2">FINANCES</h1>
            <p className="text-sm text-[var(--text-dim)] mb-8">Track income and expenses across all projects.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="admin-stat green">
                <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Total Income</div>
                <div className="font-display text-3xl tracking-wide">{totalIncome.toLocaleString()} EGP</div>
              </div>
              <div className="admin-stat red">
                <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Total Expenses</div>
                <div className="font-display text-3xl tracking-wide">{totalExpenses.toLocaleString()} EGP</div>
              </div>
              <div className="admin-stat yellow">
                <div className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-semibold mb-1">Net Profit</div>
                <div className="font-display text-3xl tracking-wide">{(totalIncome - totalExpenses).toLocaleString()} EGP</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="admin-card">
                <h3 className="font-display text-xl tracking-wide mb-4 text-green-400"><i className="fa-solid fa-arrow-trend-up mr-2" />INCOME</h3>
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Amount</th><th>Source</th><th>Date</th></tr></thead>
                  <tbody>
                    {income.map((i) => (
                      <tr key={i.id}>
                        <td className="font-medium">{i.title}</td>
                        <td className="text-green-400">{Number(i.amount).toLocaleString()} EGP</td>
                        <td><span className="status-badge status-accepted">{i.source}</span></td>
                        <td className="text-[var(--text-dim)] text-xs">{i.date}</td>
                      </tr>
                    ))}
                    {income.length === 0 && <tr><td colSpan={4} className="text-center text-[var(--text-dim)] py-6">No income records.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="admin-card">
                <h3 className="font-display text-xl tracking-wide mb-4 text-red-400"><i className="fa-solid fa-arrow-trend-down mr-2" />EXPENSES</h3>
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Amount</th><th>Category</th><th>Date</th></tr></thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr key={e.id}>
                        <td className="font-medium">{e.title}</td>
                        <td className="text-red-400">{Number(e.amount).toLocaleString()} EGP</td>
                        <td><span className="status-badge status-declined">{e.category}</span></td>
                        <td className="text-[var(--text-dim)] text-xs">{e.date}</td>
                      </tr>
                    ))}
                    {expenses.length === 0 && <tr><td colSpan={4} className="text-center text-[var(--text-dim)] py-6">No expense records.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
