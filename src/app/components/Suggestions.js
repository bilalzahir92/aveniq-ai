export default function Suggestions({ onSelect }) {
  const suggestions = [
    "How is a property valued?",
    "What affects property prices?",
    "What is a good real estate investment?",
  ];

  return (
    <div className="mt-6 w-full">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
        Suggested Questions
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="group flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs font-medium text-[#64748B] shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:bg-[#F8FBFF] hover:text-[#2563EB] hover:shadow-[0_6px_16px_rgba(37,99,235,0.07)] active:translate-y-0"
          >
            <span>{suggestion}</span>

            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-3.5 w-3.5 shrink-0 text-[#CBD5E1] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#2563EB]"
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
        ))}
      </div>
    </div>
  );
}