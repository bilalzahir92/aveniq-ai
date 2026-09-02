export default function ContextPanel() {
  const documents = [
    {
      type: "PDF",
      name: "Property Report",
      detail: "Page 12 · Relevant section",
    },
    {
      type: "PDF",
      name: "Market Analysis",
      detail: "Page 8 · Relevant section",
    },
    {
      type: "DOC",
      name: "Investment Strategy",
      detail: "Section 4 · Relevant section",
    },
  ];

  return (
    <aside className="hidden w-80 shrink-0 border-l border-[#E5E7EB] bg-white xl:flex xl:flex-col">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DBEAFE] bg-[#EFF6FF]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 text-[#2563EB]"
            >
              <path
                d="M12 3v18M3 12h18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#111827]">
            Context
          </h3>
        </div>

        <p className="mt-2 pl-10 text-[11px] leading-5 text-[#6B7280]">
          Relevant information for this conversation
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              Relevant Documents
            </h4>

            <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-1.5 text-[10px] font-medium text-[#64748B]">
              {documents.length}
            </span>
          </div>

          <div className="space-y-2">
            {documents.map((document) => (
              <div
                key={document.name}
                className="group cursor-pointer rounded-xl border border-[#E5E7EB] bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:bg-[#FAFCFF] hover:shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] text-[9px] font-bold tracking-wide text-[#2563EB] transition-colors duration-200 group-hover:border-[#BFDBFE] group-hover:bg-[#E0EDFF]">
                    {document.type}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#1F2937]">
                      {document.name}
                    </p>

                    <p className="mt-1 text-[10px] text-[#9CA3AF]">
                      {document.detail}
                    </p>
                  </div>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5 shrink-0 text-[#CBD5E1] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                  >
                    <path
                      d="m9 18 6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 px-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              Property Information
            </h4>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-[#9CA3AF]">
                  Property Type
                </p>

                <p className="mt-1 text-[13px] font-medium text-[#1F2937]">
                  Multi-Family
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#9CA3AF]">
                  Location
                </p>

                <p className="mt-1 text-[13px] font-medium text-[#1F2937]">
                  Not specified
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#9CA3AF]">
                  Status
                </p>

                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-medium text-[#2563EB]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                    Under Review
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 px-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              AI Context
            </h4>
          </div>

          <div className="rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#60A5FA] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563EB]" />
              </span>

              <span className="text-[12px] font-medium text-[#1F2937]">
                Knowledge connected
              </span>
            </div>

            <p className="mt-2.5 text-[10px] leading-5 text-[#6B7280]">
              AVENIQ AI uses relevant knowledge and documents to provide
              grounded answers.
            </p>

            <div className="mt-4 h-px bg-[#E5E7EB]" />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-[#9CA3AF]">
                Knowledge status
              </span>

              <span className="text-[10px] font-semibold text-[#2563EB]">
                Active
              </span>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}