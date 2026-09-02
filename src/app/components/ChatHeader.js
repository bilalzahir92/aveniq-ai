"use client";

import { useState } from "react";

export default function ChatHeader() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-3 sm:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-sm font-semibold text-[#2563EB] ring-1 ring-[#DBEAFE]">
          AI
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-[#0F172A]">
            AI Assistant
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Real Estate Intelligence
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          className="hidden rounded-lg px-3 py-2 text-sm text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A] sm:block"
        >
          New Chat
        </button>

        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Chat options"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
        >
          ⋯
        </button>

        {showMenu && (
          <div className="absolute right-0 top-11 z-20 w-40 rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-lg">
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#475569] transition hover:bg-[#F1F5F9]"
            >
              Clear Chat
            </button>

            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#475569] transition hover:bg-[#F1F5F9]"
            >
              Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
}