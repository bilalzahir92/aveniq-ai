export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 lg:px-12">
      <a
        href="#"
        className="group flex items-center gap-1.5"
      >
        <span className="text-lg font-semibold tracking-[-0.03em] text-[#0F172A]">
          AVENIQ
        </span>

        <span className="text-lg font-semibold tracking-[-0.03em] text-[#2563EB] transition-colors duration-200 group-hover:text-[#1D4ED8]">
          AI
        </span>
      </a>

      <div className="hidden items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] p-1 md:flex">
        <a
          href="#"
          className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#0F172A] shadow-sm transition-all duration-200"
        >
          AI Assistant
        </a>

        <a
          href="#"
          className="rounded-full px-4 py-2 text-xs font-medium text-[#64748B] transition-all duration-200 hover:bg-white hover:text-[#0F172A] hover:shadow-sm"
        >
          Market Insights
        </a>

        <a
          href="#"
          className="rounded-full px-4 py-2 text-xs font-medium text-[#64748B] transition-all duration-200 hover:bg-white hover:text-[#0F172A] hover:shadow-sm"
        >
          About
        </a>
      </div>

      <button
        type="button"
        className="group flex items-center gap-2 rounded-full bg-[#2563EB] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-md active:translate-y-0"
      >
        Get Started

        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path
            d="M4 10h11M11 5l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </nav>
  );
}