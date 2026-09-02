"use client";

import { useEffect, useState } from "react";

export default function ChatBox({
  messages,
  setMessages,
  message,
  setMessage,
  feedback,
  setFeedback,
}) {
  const [documents, setDocuments] = useState([]);

  const loading = messages.some((item) => item.loading);

  useEffect(() => {
    function loadDocuments() {
      const savedDocuments =
        localStorage.getItem("aveniq-documents");

      if (!savedDocuments) {
        setDocuments([]);
        return;
      }

      try {
        const parsedDocuments = JSON.parse(savedDocuments);

        const uniqueDocuments = [];
        const seen = new Set();

        parsedDocuments.forEach((document) => {
          const key =
            document.id ||
            `${document.name}-${document.type}`
              .trim()
              .toLowerCase();

          if (!seen.has(key)) {
            seen.add(key);
            uniqueDocuments.push(document);
          }
        });

        setDocuments(uniqueDocuments);
      } catch (error) {
        console.error("DOCUMENT KNOWLEDGE ERROR:", error);
        setDocuments([]);
      }
    }

    loadDocuments();

    window.addEventListener(
      "aveniq-documents-updated",
      loadDocuments
    );

    return () => {
      window.removeEventListener(
        "aveniq-documents-updated",
        loadDocuments
      );
    };
  }, []);

  function getLatestDocuments() {
    const savedDocuments =
      localStorage.getItem("aveniq-documents");

    if (!savedDocuments) {
      return [];
    }

    try {
      const parsedDocuments = JSON.parse(savedDocuments);

      const uniqueDocuments = [];
      const seen = new Set();

      parsedDocuments.forEach((document) => {
        const key =
          document.id ||
          `${document.name}-${document.type}`
            .trim()
            .toLowerCase();

        if (!seen.has(key)) {
          seen.add(key);
          uniqueDocuments.push(document);
        }
      });

      return uniqueDocuments;
    } catch (error) {
      console.error("DOCUMENT STORAGE ERROR:", error);
      return [];
    }
  }

  async function generateResponse(conversation, loadingId) {
    try {
      const latestDocuments = getLatestDocuments();

      setDocuments(latestDocuments);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversation,
          documents: latestDocuments,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Gemini request failed."
        );
      }

      if (!data.reply) {
        throw new Error(
          "No response was returned by the AI."
        );
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === loadingId
            ? {
                id: loadingId,
                role: "assistant",
                content: data.reply,
                sources: data.sources || [],
              }
            : item
        )
      );
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages((current) =>
        current.map((item) =>
          item.id === loadingId
            ? {
                id: loadingId,
                role: "assistant",
                content:
                  error.message ||
                  "Unable to connect to the AI service.",
                error: true,
              }
            : item
        )
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setMessage("");

    const loadingMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      loading: true,
    };

    setMessages((current) => [
      ...current,
      loadingMessage,
    ]);

    await generateResponse(
      updatedMessages,
      loadingMessage.id
    );
  }

  async function regenerateMessage(messageId) {
    if (loading) return;

    const assistantIndex = messages.findIndex(
      (item) => item.id === messageId
    );

    if (assistantIndex === -1) return;

    const conversation = messages.slice(
      0,
      assistantIndex
    );

    const loadingMessage = {
      id: messageId,
      role: "assistant",
      content: "",
      loading: true,
    };

    setMessages((current) =>
      current.map((item) =>
        item.id === messageId
          ? loadingMessage
          : item
      )
    );

    setFeedback((current) => {
      const updated = { ...current };
      delete updated[messageId];
      return updated;
    });

    await generateResponse(
      conversation,
      messageId
    );
  }

  function handleFeedback(messageId, value) {
    setFeedback((current) => ({
      ...current,
      [messageId]:
        current[messageId] === value
          ? null
          : value,
    }));
  }

  async function copyMessage(content) {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("COPY ERROR:", error);
    }
  }

  return (
    <div className="w-full">
      {messages.length > 0 && (
        <div className="mb-6 space-y-6">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 ${
                item.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {item.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-xs font-semibold text-[#2563EB] ring-1 ring-[#DBEAFE]">
                  AI
                </div>
              )}

              {item.loading ? (
                <div className="rounded-2xl rounded-tl-md border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563EB]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563EB]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2563EB]" />
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-3xl ${
                    item.role === "user"
                      ? "order-first"
                      : ""
                  }`}
                >
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-sm leading-7 ${
                      item.role === "user"
                        ? "rounded-br-md bg-[#2563EB] text-white shadow-sm"
                        : item.error
                          ? "rounded-tl-md border border-red-200 bg-red-50 text-red-700"
                          : "rounded-tl-md border border-[#E2E8F0] bg-white text-[#334155] shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>

                  {item.role === "assistant" &&
                    !item.error &&
                    item.sources?.length > 0 && (
                      <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-white p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                          Sources
                        </p>

                        <div className="space-y-2">
                          {item.sources.map(
                            (source, index) => (
                              <div
                                key={
                                  source.id ||
                                  `${source.name}-${index}`
                                }
                                className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2"
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#EFF6FF] text-[10px] font-semibold text-[#2563EB]">
                                  {source.type || "DOC"}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-medium text-[#334155]">
                                    {source.name}
                                  </p>

                                  <p className="text-[10px] text-[#94A3B8]">
                                    Knowledge source
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {item.role === "assistant" &&
                    !item.error && (
                      <div className="mt-2 flex items-center gap-1 px-1">
                        <button
                          type="button"
                          onClick={() =>
                            copyMessage(item.content)
                          }
                          className="rounded-md px-2 py-1 text-xs text-[#94A3B8] transition hover:bg-[#F8FAFC] hover:text-[#2563EB]"
                        >
                          Copy
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            regenerateMessage(item.id)
                          }
                          disabled={loading}
                          className="rounded-md px-2 py-1 text-xs text-[#94A3B8] transition hover:bg-[#F8FAFC] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Regenerate
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleFeedback(
                              item.id,
                              "helpful"
                            )
                          }
                          className={`rounded-md px-2 py-1 text-sm transition ${
                            feedback[item.id] === "helpful"
                              ? "bg-[#EFF6FF] text-[#2563EB]"
                              : "text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#2563EB]"
                          }`}
                          aria-label="Helpful"
                        >
                          👍
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleFeedback(
                              item.id,
                              "not-helpful"
                            )
                          }
                          className={`rounded-md px-2 py-1 text-sm transition ${
                            feedback[item.id] === "not-helpful"
                              ? "bg-red-50 text-red-500"
                              : "text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-red-500"
                          }`}
                          aria-label="Not helpful"
                        >
                          👎
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-[#CBD5E1] bg-white shadow-sm transition focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/10">
          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about properties, markets, investments..."
            rows={3}
            className="w-full resize-none bg-transparent px-5 py-4 text-sm text-[#111827] outline-none placeholder:text-[#94A3B8]"
          />

          <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3">
            <p className="text-xs text-[#94A3B8]">
              Shift + Enter for new line
            </p>

            <button
              type="submit"
              disabled={
                loading || !message.trim()
              }
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Thinking..."
                : "Send"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}