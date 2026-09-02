export default function ContextPanel() {
  return (
    <aside className="hidden w-80 border-l border-[#2B342F] bg-[#111512] xl:flex xl:flex-col">
      <div className="border-b border-[#2B342F] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#F3F6F4]">
          Context
        </h3>

        <p className="mt-1 text-xs text-[#68736C]">
          Relevant information for this conversation
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#68736C]">
              Relevant Documents
            </h4>

            <span className="rounded-full bg-[#202923] px-2 py-0.5 text-[11px] text-[#89958D]">
              3
            </span>
          </div>

          <div className="space-y-2">
            <div className="rounded-xl border border-[#303A34] bg-[#1C231F] p-3 transition hover:border-[#435047]">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#202923] text-[10px] font-semibold text-[#78D6A3]">
                  PDF
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#DDE4DF]">
                    Property Report
                  </p>

                  <p className="mt-1 text-xs text-[#68736C]">
                    Page 12 · Relevant section
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#303A34] bg-[#1C231F] p-3 transition hover:border-[#435047]">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#202923] text-[10px] font-semibold text-[#78D6A3]">
                  PDF
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#DDE4DF]">
                    Market Analysis
                  </p>

                  <p className="mt-1 text-xs text-[#68736C]">
                    Page 8 · Relevant section
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#303A34] bg-[#1C231F] p-3 transition hover:border-[#435047]">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#202923] text-[10px] font-semibold text-[#78D6A3]">
                  DOC
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#DDE4DF]">
                    Investment Strategy
                  </p>

                  <p className="mt-1 text-xs text-[#68736C]">
                    Section 4 · Relevant section
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h4 className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#68736C]">
            Property Information
          </h4>

          <div className="rounded-xl border border-[#303A34] bg-[#1C231F] p-4">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#68736C]">
                  Property Type
                </p>

                <p className="mt-1 text-sm font-medium text-[#DDE4DF]">
                  Multi-Family
                </p>
              </div>

              <div>
                <p className="text-xs text-[#68736C]">
                  Location
                </p>

                <p className="mt-1 text-sm font-medium text-[#DDE4DF]">
                  Not specified
                </p>
              </div>

              <div>
                <p className="text-xs text-[#68736C]">
                  Status
                </p>

                <span className="mt-1 inline-flex rounded-full border border-[#385342] bg-[#202923] px-2.5 py-1 text-xs font-medium text-[#78D6A3]">
                  Under Review
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h4 className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#68736C]">
            AI Context
          </h4>

          <div className="rounded-xl border border-[#303A34] bg-[#1C231F] p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#78D6A3]" />

              <span className="text-sm font-medium text-[#DDE4DF]">
                Knowledge connected
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-[#68736C]">
              AVENIQ AI will use relevant knowledge and documents to answer
              questions.
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
}