"use client";

import { useEffect, useRef, useState } from "react";

export default function Documents() {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Normalize document names for duplicate checking
  function normalizeName(name = "") {
    return name.trim().toLowerCase();
  }

  // Remove duplicate documents by name
  function removeDuplicates(documentList = []) {
    const seen = new Set();

    return documentList.filter((document) => {
      const key = normalizeName(document.name);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  // Load documents from localStorage
  useEffect(() => {
    const savedDocuments = localStorage.getItem("aveniq-documents");

    if (savedDocuments) {
      try {
        const parsedDocuments = JSON.parse(savedDocuments);

        const uniqueDocuments = removeDuplicates(parsedDocuments);

        setDocuments(uniqueDocuments);

        localStorage.setItem(
          "aveniq-documents",
          JSON.stringify(uniqueDocuments)
        );

        window.dispatchEvent(
          new Event("aveniq-documents-updated")
        );
      } catch (error) {
        console.error("DOCUMENT STORAGE ERROR:", error);
        setDocuments([]);
      }
    } else {
      const defaultDocuments = [
        {
          id: "doc-1",
          name: "Property Report",
          type: "PDF",
          date: "Sep 01, 2026",
          status: "Ready",
          fileUrl: null,
          text: "",
        },
        {
          id: "doc-2",
          name: "Market Analysis",
          type: "PDF",
          date: "Sep 01, 2026",
          status: "Processing",
          fileUrl: null,
          text: "",
        },
        {
          id: "doc-3",
          name: "Investment Strategy",
          type: "DOCX",
          date: "Aug 30, 2026",
          status: "Ready",
          fileUrl: null,
          text: "",
        },
      ];

      setDocuments(defaultDocuments);

      localStorage.setItem(
        "aveniq-documents",
        JSON.stringify(defaultDocuments)
      );
    }
  }, []);

  // Keep localStorage synchronized
  useEffect(() => {
    if (documents.length > 0) {
      const uniqueDocuments = removeDuplicates(documents);

      // Only update if duplicates were actually found
      if (uniqueDocuments.length !== documents.length) {
        setDocuments(uniqueDocuments);
        return;
      }

      localStorage.setItem(
        "aveniq-documents",
        JSON.stringify(documents)
      );

      window.dispatchEvent(
        new Event("aveniq-documents-updated")
      );
    }
  }, [documents]);

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    for (const file of files) {
      const extension =
        file.name.split(".").pop()?.toUpperCase() || "FILE";

      const documentName = file.name.replace(/\.[^/.]+$/, "");

      const normalizedDocumentName =
        normalizeName(documentName);

      // Check current documents before upload
      const alreadyExists = documents.some(
        (document) =>
          normalizeName(document.name) ===
          normalizedDocumentName
      );

      if (alreadyExists) {
        console.log(
          `Document already exists: ${documentName}`
        );
        continue;
      }

      const documentId = crypto.randomUUID();

      const newDocument = {
        id: documentId,
        name: documentName,
        type: extension,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        status: "Processing",
        fileUrl: URL.createObjectURL(file),
        text: "",
      };

      // Add document while protecting against duplicates
      setDocuments((current) => {
        const exists = current.some(
          (document) =>
            normalizeName(document.name) ===
            normalizedDocumentName
        );

        if (exists) {
          return current;
        }

        return [newDocument, ...current];
      });

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

        setDocuments((current) =>
          removeDuplicates(
            current.map((document) =>
              document.id === documentId
                ? {
                    ...document,
                    status: "Ready",
                    text: data.text || "",
                  }
                : document
            )
          )
        );
      } catch (error) {
        console.error(
          "DOCUMENT UPLOAD ERROR:",
          error
        );

        setDocuments((current) =>
          removeDuplicates(
            current.map((document) =>
              document.id === documentId
                ? {
                    ...document,
                    status: "Failed",
                  }
                : document
            )
          )
        );
      }
    }

    // Reset file input
    event.target.value = "";
  }

  function deleteDocument(documentId) {
    const document = documents.find(
      (item) => item.id === documentId
    );

    if (document?.fileUrl) {
      URL.revokeObjectURL(document.fileUrl);
    }

    setDocuments((current) =>
      current.filter((item) => item.id !== documentId)
    );

    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null);
    }
  }

  function viewDocument(document) {
    if (document.status !== "Ready") return;

    setSelectedDocument(document);
  }

  function closeDocument() {
    setSelectedDocument(null);
  }

  /*
    IMPORTANT:
    We remove duplicates AGAIN before filtering/searching.

    This guarantees that even if localStorage/state somehow
    contains duplicate documents, the UI will only render
    one copy.
  */
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

  const isPdf =
    selectedDocument?.type === "PDF" &&
    selectedDocument?.fileUrl;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F8FAFC]">
      {/* HEADER */}
      <header className="flex min-h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
        <div>
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Documents
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Manage your real estate knowledge sources
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            multiple
            onChange={handleUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
          >
            Upload Document
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">

          {/* STATS */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#64748B]">
                Total Documents
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#0F172A]">
                {uniqueDocuments.length}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#64748B]">
                Ready
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#2563EB]">
                {readyCount}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#64748B]">
                Processing
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#0F172A]">
                {processingCount}
              </p>

              {failedCount > 0 && (
                <p className="mt-1 text-xs text-red-500">
                  {failedCount} failed
                </p>
              )}
            </div>
          </div>

          {/* SEARCH */}
          <div className="mb-5">
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search documents..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
            />
          </div>

          {/* DOCUMENT TABLE */}
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">

            {/* TABLE HEADER */}
            <div className="grid grid-cols-[1fr_100px_150px_120px_130px] border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                Document
              </p>

              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                Type
              </p>

              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                Added
              </p>

              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                Status
              </p>

              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                Action
              </p>
            </div>

            {/* EMPTY STATE */}
            {filteredDocuments.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-[#0F172A]">
                  No documents found
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Try another search or upload a document.
                </p>
              </div>
            ) : (
              /* DOCUMENT ROWS */
              filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="grid grid-cols-[1fr_100px_150px_120px_130px] items-center border-b border-[#E2E8F0] px-5 py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0F172A]">
                      {document.name}
                    </p>
                  </div>

                  <p className="text-xs font-medium text-[#64748B]">
                    {document.type}
                  </p>

                  <p className="text-xs text-[#64748B]">
                    {document.date}
                  </p>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        document.status === "Ready"
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : document.status === "Failed"
                            ? "bg-red-50 text-red-600"
                            : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
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
                      className="text-xs font-medium text-[#2563EB] transition hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:text-[#CBD5E1]"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteDocument(document.id)
                      }
                      className="text-xs font-medium text-[#94A3B8] transition hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ADD KNOWLEDGE */}
          <div className="mt-5 rounded-xl border border-dashed border-[#CBD5E1] bg-white px-6 py-8 text-center">
            <p className="text-sm font-medium text-[#0F172A]">
              Add knowledge to AVENIQ
            </p>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#64748B]">
              Upload property reports, market research,
              investment documents, and other real estate
              files to build your knowledge base.
            </p>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="mt-4 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-medium text-[#2563EB] transition hover:border-[#93C5FD] hover:bg-[#EFF6FF]"
            >
              Choose Files
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENT VIEW MODAL */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-6">
          <div
            className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl ${
              isPdf ? "max-w-5xl" : "max-w-lg"
            }`}
          >

            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0F172A]">
                  {selectedDocument.name}
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  {selectedDocument.type} ·{" "}
                  {selectedDocument.status}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDocument}
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* PDF */}
            {isPdf ? (
              <div className="min-h-0 flex-1 bg-[#F1F5F9] p-4">
                <iframe
                  src={selectedDocument.fileUrl}
                  title={selectedDocument.name}
                  className="h-[70vh] w-full rounded-lg border border-[#E2E8F0] bg-white"
                />
              </div>
            ) : (
              /* OTHER DOCUMENTS */
              <div className="space-y-5 overflow-y-auto px-6 py-6">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                    Document
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#0F172A]">
                    {selectedDocument.name}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">

                  <div>
                    <p className="text-xs text-[#64748B]">
                      Type
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#0F172A]">
                      {selectedDocument.type}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#64748B]">
                      Added
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#0F172A]">
                      {selectedDocument.date}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#64748B]">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#2563EB]">
                      {selectedDocument.status}
                    </p>
                  </div>

                </div>

                {selectedDocument.text && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">
                      Extracted Content
                    </p>

                    <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                      <p className="whitespace-pre-wrap text-xs leading-6 text-[#475569]">
                        {selectedDocument.text}
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
                  <p className="text-xs font-medium text-[#1D4ED8]">
                    Knowledge source
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#64748B]">
                    Document content has been extracted and
                    is ready to be used by the AVENIQ knowledge
                    system.
                  </p>
                </div>

              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="flex shrink-0 justify-end border-t border-[#E2E8F0] px-6 py-4">
              <button
                type="button"
                onClick={closeDocument}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
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

