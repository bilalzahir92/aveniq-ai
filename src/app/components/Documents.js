"use client";

import { useEffect, useRef, useState } from "react";

const normalizeName = (name = "") =>
  name.trim().toLowerCase();

const getDocumentType = (name = "") =>
  name.split(".").pop()?.toUpperCase() || "FILE";

const formatDate = (date) => {
  if (!date) return "Unknown";

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
  );
};

const removeDuplicates = (documentList = []) => {
  const seen = new Set();

  return documentList.filter((document) => {
    const key = normalizeName(document.name);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const mapSupabaseDocument = (document) => ({
  id: document.id,
  name: document.name,
  type: getDocumentType(document.name),
  date: formatDate(document.created_at),
  status: "Ready",
  text: document.content || "",
});

export default function Documents() {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/documents", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;

        if (data?.error) {
          throw new Error(data.error);
        }

        setDocuments(
          removeDuplicates(
            (data?.documents || []).map(
              mapSupabaseDocument
            )
          )
        );
      })
      .catch((error) => {
        console.error(
          "DOCUMENT LOAD ERROR:",
          error
        );

        if (active) {
          setDocuments([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    for (const file of files) {
      const extension =
        file.name.split(".").pop()?.toUpperCase() || "FILE";

      const alreadyExists = documents.some(
        (document) =>
          normalizeName(document.name) ===
          normalizeName(file.name)
      );

      if (alreadyExists) continue;

      const temporaryDocumentId = crypto.randomUUID();

      const newDocument = {
        id: temporaryDocumentId,
        name: file.name,
        type: extension,
        date: formatDate(new Date()),
        status: "Processing",
        text: "",
      };

      setDocuments((current) => [
        newDocument,
        ...current,
      ]);

      try {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        const responseText = await response.text();

        let data = {};

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          throw new Error(
            "The document server returned an invalid response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error || "Document processing failed."
          );
        }

        if (!data?.document?.id) {
          throw new Error(
            "Document was uploaded but no database ID was returned."
          );
        }

        const uploadedDocument = {
          id: data.document.id,
          name: data.document.name || file.name,
          type: data.document.type || extension,
          date: formatDate(new Date()),
          status: "Ready",
          text: data.text || "",
        };

        setDocuments((current) =>
          removeDuplicates(
            current.map((document) =>
              document.id === temporaryDocumentId
                ? uploadedDocument
                : document
            )
          )
        );
      } catch (error) {
        console.error("DOCUMENT UPLOAD ERROR:", error);

        setDocuments((current) =>
          current.map((document) =>
            document.id === temporaryDocumentId
              ? {
                  ...document,
                  status: "Failed",
                }
              : document
          )
        );
      }
    }

    event.target.value = "";
  }

  async function deleteDocument(documentId) {
    const document = documents.find(
      (item) => item.id === documentId
    );

    if (!document || deletingDocumentId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${document.name}"?`
    );

    if (!confirmed) return;

    setDeletingDocumentId(documentId);

    try {
      const response = await fetch("/api/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to delete document."
        );
      }

      setDocuments((current) =>
        current.filter(
          (item) => item.id !== documentId
        )
      );

      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error("DOCUMENT DELETE ERROR:", error);

      alert(
        error?.message ||
          "Failed to delete document. Please try again."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  function viewDocument(document) {
    if (document.status !== "Ready") return;

    setSelectedDocument(document);
  }

  const uniqueDocuments = removeDuplicates(documents);

  const normalizedSearch = normalizeName(search);

  const filteredDocuments = uniqueDocuments.filter(
    (document) =>
      normalizeName(document.name).includes(
        normalizedSearch
      )
  );

  const readyCount = uniqueDocuments.filter(
    (document) => document.status === "Ready"
  ).length;

  const processingCount = uniqueDocuments.filter(
    (document) => document.status === "Processing"
  ).length;

  const failedCount = uniqueDocuments.filter(
    (document) => document.status === "Failed"
  ).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F8FAFC]">
      <header className="flex min-h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#0F172A]">
              Documents
            </h2>

            <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
              Knowledge Base
            </span>
          </div>

          <p className="mt-1 text-xs text-[#64748B]">
            Manage your real estate knowledge sources
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.txt"
            multiple
            onChange={handleUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="group flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-md active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 11.5v2A2.5 2.5 0 0 0 6.5 16h7a2.5 2.5 0 0 0 2.5-2.5v-2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Upload Document
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  Total Documents
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#64748B] transition-colors group-hover:bg-[#EFF6FF] group-hover:text-[#2563EB]">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                  >
                    <path
                      d="M5 3.5h7l3 3v10H5v-13Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3.5v3h3M8 10h4M8 13h4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0F172A]">
                {uniqueDocuments.length}
              </p>

              <p className="mt-1 text-[11px] text-[#94A3B8]">
                Knowledge sources
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  Ready
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0F172A]">
                {readyCount}
              </p>

              <p className="mt-1 text-[11px] text-[#94A3B8]">
                Available to AVENIQ AI
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  Processing
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#64748B]">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M10 6.5v3.8l2.5 1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0F172A]">
                {processingCount}
              </p>

              <p className="mt-1 text-[11px] text-[#94A3B8]">
                {failedCount > 0
                  ? `${failedCount} failed`
                  : "Currently processing"}
              </p>
            </div>
          </div>

          <div className="mb-5">
            <div className="relative">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
              >
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="m12.5 12.5 4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search documents..."
                className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-11 pr-4 text-sm text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.02)] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#93C5FD] focus:ring-4 focus:ring-[#2563EB]/10"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <div className="hidden grid-cols-[minmax(0,1fr)_90px_130px_110px_130px] border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 md:grid">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Document
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Type
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Added
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Status
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Actions
              </p>
            </div>

            {loading ? (
              <div className="space-y-0">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 border-b border-[#E2E8F0] px-5 py-5 last:border-0"
                  >
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-[#E2E8F0]" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-48 animate-pulse rounded bg-[#E2E8F0]" />
                      <div className="h-2.5 w-28 animate-pulse rounded bg-[#F1F5F9]" />
                    </div>

                    <div className="hidden h-3 w-12 animate-pulse rounded bg-[#F1F5F9] md:block" />
                    <div className="hidden h-3 w-20 animate-pulse rounded bg-[#F1F5F9] md:block" />
                  </div>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#94A3B8]">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-5 w-5"
                  >
                    <path
                      d="M5 3.5h7l3 3v10H5v-13Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3.5v3h3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-medium text-[#0F172A]">
                  {search
                    ? "No documents found"
                    : "No documents yet"}
                </p>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#64748B]">
                  {search
                    ? "Try a different search term."
                    : "Upload your first knowledge source to start building your AVENIQ knowledge base."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-5 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-2 text-xs font-medium text-[#2563EB] transition-all duration-200 hover:border-[#BFDBFE] hover:bg-[#DBEAFE]"
                  >
                    Upload your first document
                  </button>
                )}
              </div>
            ) : (
              filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="group border-b border-[#E2E8F0] px-5 py-4 transition-colors duration-200 last:border-0 hover:bg-[#FAFCFF]"
                >
                  <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_90px_130px_110px_130px]">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] text-[9px] font-bold tracking-wide text-[#2563EB]">
                        {document.type}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#0F172A]">
                          {document.name}
                        </p>

                        <p className="mt-1 text-[10px] text-[#94A3B8] md:hidden">
                          {document.date}
                        </p>
                      </div>
                    </div>

                    <p className="hidden text-xs font-medium text-[#64748B] md:block">
                      {document.type}
                    </p>

                    <p className="hidden text-xs text-[#64748B] md:block">
                      {document.date}
                    </p>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          document.status === "Ready"
                            ? "bg-[#EFF6FF] text-[#2563EB]"
                            : document.status === "Failed"
                            ? "bg-red-50 text-red-600"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            document.status === "Ready"
                              ? "bg-[#2563EB]"
                              : document.status ===
                                "Failed"
                              ? "bg-red-500"
                              : "animate-pulse bg-[#94A3B8]"
                          }`}
                        />

                        {document.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          viewDocument(document)
                        }
                        disabled={
                          document.status !== "Ready"
                        }
                        className="rounded-md px-2 py-1 text-xs font-medium text-[#2563EB] transition-colors duration-200 hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:text-[#CBD5E1] disabled:hover:bg-transparent"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteDocument(document.id)
                        }
                        disabled={
                          deletingDocumentId !== null
                        }
                        className="rounded-md px-2 py-1 text-xs font-medium text-[#94A3B8] transition-colors duration-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingDocumentId ===
                        document.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-6 sm:flex-row">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">
                Add knowledge to AVENIQ
              </p>

              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                Upload DOCX or TXT files to expand your AI knowledge base.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="shrink-0 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-medium text-[#2563EB] shadow-sm transition-all duration-200 hover:border-[#BFDBFE] hover:bg-[#EFF6FF]"
            >
              Choose Files
            </button>
          </div>
        </div>
      </div>

      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4 backdrop-blur-[2px] sm:p-6"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] text-[9px] font-bold text-[#2563EB]">
                  {selectedDocument.type}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">
                    {selectedDocument.name}
                  </p>

                  <p className="mt-1 text-[10px] text-[#94A3B8]">
                    {selectedDocument.type} ·{" "}
                    {selectedDocument.date}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedDocument(null)
                }
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
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
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <div className="mb-5 flex items-center justify-between rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                    Knowledge Status
                  </p>

                  <p className="mt-1 text-xs text-[#475569]">
                    This document is available to AVENIQ AI.
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-medium text-[#2563EB]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                  Ready
                </span>
              </div>

              {selectedDocument.text ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                      Extracted Content
                    </p>

                    <span className="text-[10px] text-[#94A3B8]">
                      {selectedDocument.text.length.toLocaleString()} characters
                    </span>
                  </div>

                  <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <p className="whitespace-pre-wrap text-xs leading-6 text-[#475569]">
                      {selectedDocument.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-10 text-center">
                  <p className="text-sm font-medium text-[#0F172A]">
                    No extracted content
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    This document does not contain readable text.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-[#E2E8F0] px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedDocument(null)
                }
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}