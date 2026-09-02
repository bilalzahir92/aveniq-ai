"use client";

import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  function handleSearch(e) {
    e.preventDefault();

    const searchQuery = query.trim().toLowerCase();

    if (!searchQuery) {
      setResults([]);
      setSearched(false);
      return;
    }

    const savedDocuments = localStorage.getItem("aveniq-documents");

    if (!savedDocuments) {
      setResults([]);
      setSearched(true);
      return;
    }

    try {
      const documents = JSON.parse(savedDocuments);

      const words = searchQuery
        .split(/\s+/)
        .filter((word) => word.length > 2);

      // Prevent the same document from appearing more than once
      const seenDocuments = new Set();

      const matchedDocuments = documents
        .filter(
          (document) =>
            document.status === "Ready" &&
            document.text?.trim()
        )
        .map((document) => {
          const content =
            `${document.name} ${document.text}`.toLowerCase();

          const matchedWords = words.filter((word) =>
            content.includes(word)
          );

          return {
            ...document,
            score: matchedWords.length,
          };
        })
        .filter((document) => document.score > 0)
        .sort((a, b) => b.score - a.score)
        .filter((document) => {
          // Use document ID when available.
          // Fall back to name + type if ID is missing.
          const key =
            document.id ||
            `${document.name}-${document.type}`
              .trim()
              .toLowerCase();

          if (seenDocuments.has(key)) {
            return false;
          }

          seenDocuments.add(key);
          return true;
        });

      setResults(matchedDocuments);
      setSearched(true);
    } catch (error) {
      console.error("SEARCH ERROR:", error);
      setResults([]);
      setSearched(true);
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
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Header */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">
            Knowledge Discovery
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
            Search
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Search across your real estate knowledge and documents.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="mt-8 flex gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm"
        >
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] transition focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/10">
            <span className="px-3 text-[#94A3B8]">
              /
            </span>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, properties, reports..."
              className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-[#111827] outline-none placeholder:text-[#94A3B8]"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
          >
            Search
          </button>
        </form>

        {/* Results */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Search Results
              </h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Results from your connected knowledge base
              </p>
            </div>

            <span className="rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#64748B]">
              {results.length}{" "}
              {results.length === 1 ? "result" : "results"}
            </span>
          </div>

          {/* Initial State */}
          {!searched ? (
            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-sm font-semibold text-[#2563EB] ring-1 ring-[#DBEAFE]">
                S
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#1E293B]">
                Search your knowledge base
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                Search results from your uploaded documents and internal real
                estate knowledge will appear here.
              </p>
            </div>
          ) : results.length === 0 ? (
            /* No Results */
            <div className="rounded-xl border border-[#E2E8F0] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8FAFC] text-sm font-semibold text-[#64748B] ring-1 ring-[#E2E8F0]">
                0
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#1E293B]">
                No results found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                Try different keywords or search for another document topic.
              </p>
            </div>
          ) : (
            /* Results List */
            <div className="space-y-3">
              {results.map((document) => (
                <button
                  key={document.id || `${document.name}-${document.type}`}
                  type="button"
                  onClick={() => setSelectedDocument(document)}
                  className="block w-full rounded-xl border border-[#E2E8F0] bg-white p-5 text-left shadow-sm transition hover:border-[#93C5FD] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#0F172A]">
                        {document.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-[11px] font-medium text-[#2563EB]">
                          {document.type}
                        </span>

                        <span className="text-xs text-[#94A3B8]">
                          {document.date}
                        </span>
                      </div>
                    </div>

                    <span className="shrink-0 text-xs font-medium text-[#2563EB]">
                      View
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#64748B]">
                    {getPreview(document.text)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-6 backdrop-blur-sm"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-5">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[#0F172A]">
                  {selectedDocument.name}
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-[11px] font-medium text-[#2563EB]">
                    {selectedDocument.type}
                  </span>

                  <span className="text-xs text-[#94A3B8]">
                    {selectedDocument.date}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto px-6 py-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-[#64748B]">
                Extracted Content
              </p>

              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#475569]">
                  {selectedDocument.text}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-[#E2E8F0] px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
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