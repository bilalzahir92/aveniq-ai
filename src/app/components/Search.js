"use client";

import { useEffect, useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        document.getElementById("knowledge-search")?.focus();
      }

      if (event.key === "Escape") {
        setSelectedDocument(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    const searchQuery = query.trim().toLowerCase();

    if (!searchQuery) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/documents",
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load documents."
        );
      }

      const words = searchQuery
        .split(/\s+/)
        .filter((word) => word.length > 2);

      const matchedDocuments = (data?.documents || [])
        .filter((document) => document.content?.trim())
        .map((document) => {
          const content =
            `${document.name} ${document.content}`.toLowerCase();

          const matchedWords = words.filter((word) =>
            content.includes(word)
          );

          return {
            id: document.id,
            name: document.name,
            type:
              document.name
                ?.split(".")
                .pop()
                ?.toUpperCase() || "FILE",
            date: new Date(
              document.created_at
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            text: document.content,
            score: matchedWords.length,
          };
        })
        .filter((document) => document.score > 0)
        .sort((a, b) => b.score - a.score);

      setResults(matchedDocuments);
      setSearched(true);
    } catch (error) {
      console.error("SEARCH ERROR:", error);
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function getPreview(text) {
    const cleanText = text.replace(/\s+/g, " ").trim();

    if (cleanText.length <= 220) {
      return cleanText;
    }

    return `${cleanText.slice(0, 220)}...`;
  }

  return (
    <section className="flex-1 overflow-y-auto bg-[#F8FAFC]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-8">
        <div
          className="animate-[fadeIn_0.35s_ease-out]"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#DBEAFE] bg-[#EFF6FF]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5 text-[#2563EB]"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="m16 16 4 4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
              Knowledge Discovery
            </p>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-[#0F172A]">
            Search
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#64748B]">
            Search across your connected real estate knowledge and documents.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-7 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 focus-within:border-[#BFDBFE] focus-within:shadow-[0_10px_30px_rgba(37,99,235,0.07)]"
        >
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center text-[#94A3B8]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m16 16 4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <input
                id="knowledge-search"
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search documents, properties, reports..."
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#111827] outline-none placeholder:text-[#94A3B8]"
              />

              <div className="mr-2 hidden items-center gap-1.5 sm:flex">
                <kbd className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[10px] font-medium text-[#94A3B8]">
                  Ctrl
                </kbd>

                <kbd className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[10px] font-medium text-[#94A3B8]">
                  K
                </kbd>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-[0_7px_20px_rgba(37,99,235,0.18)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Searching
                </>
              ) : (
                <>
                  Search

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
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#0F172A]">
                Search Results
              </h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Results from your connected knowledge base
              </p>
            </div>

            {searched && !loading && (
              <span className="shrink-0 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[10px] font-medium text-[#64748B] shadow-sm">
                {results.length}{" "}
                {results.length === 1 ? "result" : "results"}
              </span>
            )}
          </div>

          {!searched ? (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-20 text-center transition-colors duration-200 hover:border-[#BFDBFE]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m16 16 4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#1E293B]">
                Search your knowledge base
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#64748B]">
                Find information across your uploaded documents and internal
                real estate knowledge.
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5"
                >
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#E2E8F0]" />

                      <div className="flex-1">
                        <div className="h-3.5 w-44 rounded bg-[#E2E8F0]" />
                        <div className="mt-2 h-2.5 w-28 rounded bg-[#F1F5F9]" />
                      </div>
                    </div>

                    <div className="mt-5 h-2.5 w-full rounded bg-[#F1F5F9]" />
                    <div className="mt-2 h-2.5 w-4/5 rounded bg-[#F1F5F9]" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m16 16 4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8.5 8.5 13.5 13.5M13.5 8.5 8.5 13.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#1E293B]">
                No results found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#64748B]">
                Try different keywords or search for another document topic.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((document, index) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() =>
                    setSelectedDocument(document)
                  }
                  className="group block w-full rounded-2xl border border-[#E2E8F0] bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 60}ms both`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] text-[9px] font-bold tracking-wide text-[#2563EB]">
                        {document.type}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[#0F172A]">
                          {document.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-medium text-[#64748B]">
                            {document.type}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />

                          <span className="text-[10px] text-[#94A3B8]">
                            {document.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#2563EB] opacity-70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                      View

                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-3 w-3"
                      >
                        <path
                          d="M4 10h11M11 5l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-[#64748B]">
                    {getPreview(document.text)}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-[#F1F5F9] pt-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-[10px] text-[#94A3B8]">
                      Knowledge source
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-5 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_25px_70px_rgba(15,23,42,0.18)] animate-[scaleIn_0.2s_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] text-[9px] font-bold tracking-wide text-[#2563EB]">
                  {selectedDocument.type}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-[#0F172A]">
                    {selectedDocument.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-medium text-[#64748B]">
                      {selectedDocument.type}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />

                    <span className="text-[10px] text-[#94A3B8]">
                      {selectedDocument.date}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition-all duration-200 hover:bg-[#F8FAFC] hover:text-[#0F172A] active:scale-95"
                aria-label="Close"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4"
                >
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  Extracted Content
                </p>

                <span className="text-[10px] text-[#94A3B8]">
                  {selectedDocument.text?.length || 0} characters
                </span>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="whitespace-pre-wrap text-xs leading-7 text-[#475569]">
                  {selectedDocument.text}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4">
              <p className="hidden text-[10px] text-[#94A3B8] sm:block">
                Press Esc to close
              </p>

              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#475569] transition-all duration-200 hover:border-[#CBD5E1] hover:bg-[#F8FAFC] active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}