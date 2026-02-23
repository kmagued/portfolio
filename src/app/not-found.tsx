import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-7">
      <div className="text-center">
        <div className="font-display text-[8rem] md:text-[12rem] leading-none text-[var(--accent)]/[0.15] select-none">404</div>
        <h1 className="font-display text-3xl md:text-5xl tracking-wide mb-4 -mt-6">PAGE NOT FOUND</h1>
        <p className="text-[var(--text-dim)] font-light mb-10 max-w-md mx-auto">
          Looks like this page took the elevator instead of the stairs. It doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="px-8 py-3.5 rounded-full bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-[1.5px] uppercase hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,255,71,0.2)] transition-all"
        >
          <i className="fa-solid fa-arrow-left mr-2" />Back Home
        </Link>
      </div>
    </div>
  );
}
