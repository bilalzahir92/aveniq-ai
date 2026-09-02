export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-12">
      <h2 className="text-xl font-semibold tracking-tight">
        AVENIQ<span className="text-emerald-400"> AI</span>
      </h2>

      <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
        <a href="#" className="text-white">
          AI Assistant
        </a>
        <a href="#" className="transition hover:text-white">
          Market Insights
        </a>
        <a href="#" className="transition hover:text-white">
          About
        </a>
      </div>

      <button className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-300 transition hover:border-emerald-400/50 hover:text-white">
        Get Started
      </button>
    </nav>
  );
}