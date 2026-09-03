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
  const [copiedId, setCopiedId] = useState(null);

  const loading = messages.some(
    (item) => item.loading
  );

  useEffect(() => {
    if (!copiedId) return;

    const timer = setTimeout(() => {
      setCopiedId(null);
    }, 1600);

    return () => clearTimeout(timer);
  }, [copiedId]);

  async function generateResponse(conversation, loadingId) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversation,
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
          data?.error || "Gemini request failed."
        );
      }

      if (!data?.reply) {
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
                  error?.message ||
                  "Unable to connect to the AI service.",
                error: true,
              }
            : item
        )
      );
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

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

  async function copyMessage(messageId, content) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
    } catch (error) {
      console.error("COPY ERROR:", error);
    }
  }

  function renderLoading() {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#DBEAFE] bg-[#EFF6FF]">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#BFDBFE] border-t-[#2563EB]" />
        </div>

        <div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94A3B8]" />
          </div>

          <p className="mt-1 text-[10px] font-medium text-[#94A3B8]">
            AVENIQ is thinking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {messages.length > 0 && (
        <div className="mb-6 space-y-5 sm:mb-8 sm:space-y-8">
          {messages.map((item) => {
            const isUser = item.role === "user";
            const isAssistant =
              item.role === "assistant";

            return (
              <div
                key={item.id}
                className={`flex w-full animate-[chatMessageIn_240ms_ease-out] ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex w-full max-w-4xl gap-2.5 sm:gap-3 ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {isAssistant && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] text-[9px] font-bold tracking-wide text-[#2563EB] sm:h-8 sm:w-8">
                      AI
                    </div>
                  )}

                  <div
                    className={`min-w-0 ${
                      isUser
                        ? "max-w-[85%] sm:max-w-[82%]"
                        : "max-w-[92%] sm:max-w-[90%]"
                    }`}
                  >
                    {item.loading ? (
                      <div className="rounded-2xl rounded-tl-md border border-[#E2E8F0] bg-white px-3 py-3 shadow-[0_4px_18px_rgba(15,23,42,0.04)] sm:px-4 sm:py-3.5">
                        {renderLoading()}
                      </div>
                    ) : (
                      <>
                        <div
                          className={`rounded-2xl px-3.5 py-3 text-sm leading-6 sm:px-5 sm:leading-7 ${
                            isUser
                              ? "rounded-br-md bg-[#2563EB] text-white shadow-[0_6px_20px_rgba(37,99,235,0.14)]"
                              : item.error
                                ? "rounded-tl-md border border-red-200 bg-red-50 text-red-700"
                                : "rounded-tl-md border border-[#E2E8F0] bg-white text-[#334155] shadow-[0_4px_18px_rgba(15,23,42,0.035)]"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {item.content}
                          </p>
                        </div>

                        {isAssistant &&
                          !item.error &&
                          item.sources?.length > 0 && (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.035)]">
                              <div className="flex items-center justify-between border-b border-[#F1F5F9] px-3 py-3 sm:px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#2563EB] sm:h-8 sm:w-8">
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      className="h-4 w-4"
                                    >
                                      <path
                                        d="M6 4.5h9l3 3V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                      />
                                      <path
                                        d="M14 4.5V8h4M8 12h8M8 15h6"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#334155]">
                                      Sources
                                    </p>

                                    <p className="mt-0.5 hidden text-[10px] text-[#94A3B8] sm:block">
                                      Knowledge used for this answer
                                    </p>
                                  </div>
                                </div>

                                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F1F5F9] px-2 text-[10px] font-semibold text-[#64748B]">
                                  {item.sources.length}
                                </span>
                              </div>

                              <div className="divide-y divide-[#F1F5F9]">
                                {item.sources.map(
                                  (source, index) => (
                                    <div
                                      key={
                                        source.id ||
                                        `${source.name}-${index}`
                                      }
                                      className="group flex items-center gap-2.5 px-3 py-3 transition-colors duration-200 hover:bg-[#F8FAFC] sm:gap-3 sm:px-4"
                                    >
                                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] text-[8px] font-bold tracking-wide text-[#2563EB] sm:h-8 sm:w-8">
                                        {source.type ||
                                          "DOC"}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-[#334155]">
                                          {source.name}
                                        </p>

                                        <div className="mt-1 flex items-center gap-2">
                                          <span className="text-[10px] text-[#94A3B8]">
                                            Knowledge source
                                          </span>

                                          {typeof source.similarity ===
                                            "number" && (
                                            <>
                                              <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />

                                              <span className="text-[10px] font-medium text-[#64748B]">
                                                {Math.round(
                                                  source.similarity *
                                                    100
                                                )}
                                                % relevant
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#CBD5E1] transition-all duration-200 group-hover:bg-[#EFF6FF] group-hover:text-[#2563EB]">
                                        <svg
                                          viewBox="0 0 20 20"
                                          fill="none"
                                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                                        >
                                          <path
                                            d="m7 4 6 6-6 6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {isAssistant &&
                          !item.error && (
                            <div className="mt-2 flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  copyMessage(
                                    item.id,
                                    item.content
                                  )
                                }
                                className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-[#94A3B8] transition-all duration-200 hover:bg-[#F8FAFC] hover:text-[#2563EB]"
                              >
                                {copiedId === item.id
                                  ? "Copied"
                                  : "Copy"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  regenerateMessage(
                                    item.id
                                  )
                                }
                                disabled={loading}
                                className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-[#94A3B8] transition-all duration-200 hover:bg-[#F8FAFC] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
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
                                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-all duration-200 ${
                                  feedback[item.id] ===
                                  "helpful"
                                    ? "bg-[#EFF6FF] text-[#2563EB]"
                                    : "text-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#2563EB]"
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
                                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-all duration-200 ${
                                  feedback[item.id] ===
                                  "not-helpful"
                                    ? "bg-red-50 text-red-500"
                                    : "text-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-red-500"
                                }`}
                                aria-label="Not helpful"
                              >
                                👎
                              </button>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-2xl border border-[#D7DEE7] bg-white shadow-[0_6px_28px_rgba(15,23,42,0.05)] transition-all duration-200 focus-within:border-[#93C5FD] focus-within:shadow-[0_8px_30px_rgba(37,99,235,0.08)] focus-within:ring-4 focus-within:ring-[#2563EB]/5">
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            placeholder="Ask about properties, markets, investments..."
            rows={3}
            className="min-h-[80px] w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-[#111827] outline-none placeholder:text-[#94A3B8] sm:min-h-[96px] sm:px-5 sm:py-4"
          />

          <div className="flex items-center justify-between border-t border-[#F1F5F9] px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2">
              <span className="hidden h-1.5 w-1.5 rounded-full bg-[#2563EB] sm:block" />

              <p className="hidden text-[10px] text-[#94A3B8] sm:block">
                Shift + Enter for new line
              </p>

              <p className="text-[10px] text-[#CBD5E1] sm:hidden">
                Enter to send
              </p>
            </div>

            <button
              type="submit"
              disabled={
                loading || !message.trim()
              }
              className="group flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-[0_7px_18px_rgba(37,99,235,0.18)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:gap-2 sm:px-4 sm:py-2.5"
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span className="hidden sm:inline">Thinking</span>
                </>
              ) : (
                <>
                  Send

                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
        </div>
      </form>

      <p className="mt-3 text-center text-[10px] text-[#CBD5E1]">
        AVENIQ AI can make mistakes. Verify important information.
      </p>

      <style jsx>{`
        @keyframes chatMessageIn {
          from {
            opacity: 0;
            transform: translateY(7px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
