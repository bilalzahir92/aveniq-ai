export default function Suggestions({ onSelect }) {
  const suggestions = [
    "How is a property valued?",
    "What affects property prices?",
    "What is a good real estate investment?",
  ];

  return (
    <div className="mt-6">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.12em] text-[#64748B]">
        Suggested Questions
      </p>

      <div className="flex flex-wrap justify-center gap-2.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm text-[#64748B] shadow-sm transition hover:border-[#93C5FD] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}