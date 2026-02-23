"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-7">
      <div className="text-center">
        <div className="font-display text-[8rem] md:text-[12rem] leading-none text-[var(--accent2)]/[0.15] select-none">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <h1 className="font-display text-3xl md:text-5xl tracking-wide mb-4">SOMETHING WENT WRONG</h1>
        <p className="text-[var(--text-dim)] font-light mb-10 max-w-md mx-auto">
          An unexpected error occurred. Even the best athletes have off days.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={reset}
            className="px-8 py-3.5 rounded-full bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-[1.5px] uppercase hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,255,71,0.2)] transition-all"
          >
            <i className="fa-solid fa-rotate-right mr-2" />Try Again
          </button>
          <a
            href="/"
            className="px-8 py-3.5 rounded-full border border-[var(--border)] text-[var(--text)] font-semibold text-sm tracking-[1.5px] uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] hover:-translate-y-0.5 transition-all"
          >
            Back Home
          </a>
        </div>
      </div>
    </div>
  );
}
