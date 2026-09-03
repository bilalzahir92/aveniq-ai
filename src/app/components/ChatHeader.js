"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatHeader({
  onNewChat,
  onClearChat,
  onOpenSettings,
  onToggleSidebar,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-3 sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Open menu"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-[10px] font-bold tracking-wide text-white shadow-[0_4px_12px_rgba(37,99,235,0.18)] sm:h-9 sm:w-9">
          AI

          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-blue-500 sm:h-2.5 sm:w-2.5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[13px] font-semibold tracking-[-0.01em] text-slate-900">
              AI Assistant
            </h1>

            <span className="hidden items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-600 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Online
            </span>
          </div>

          <p className="mt-0.5 truncate text-[10px] text-slate-400">
            Real Estate Intelligence
          </p>
        </div>
      </div>

      <div
        ref={menuRef}
        className="relative flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() => onNewChat?.()}
          className="hidden h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:inline-flex"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-3.5 w-3.5"
          >
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          New Chat
        </button>

        <button
          type="button"
          onClick={() =>
            setShowMenu((current) => !current)
          }
          aria-label="Chat options"
          aria-expanded={showMenu}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
            showMenu
              ? "bg-slate-100 text-slate-900"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <span className="flex items-center gap-[3px]">
            <span className="h-1 w-1 rounded-full bg-current" />
            <span className="h-1 w-1 rounded-full bg-current" />
            <span className="h-1 w-1 rounded-full bg-current" />
          </span>
        </button>

        <div
          className={`absolute right-0 top-11 w-44 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.10)] transition-all duration-200 ${
            showMenu
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-1 scale-95 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              onClearChat?.();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-3.5 w-3.5 text-slate-400"
            >
              <path
                d="M4.5 5.5h11M7 5.5V4h6v1.5M6 8v7.5h8V8M8.5 10.5v3M11.5 10.5v3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Clear Chat
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              onOpenSettings?.();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-3.5 w-3.5 text-slate-400"
            >
              <path
                d="M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM10 7v3l2 1.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Settings
          </button>
        </div>
      </div>
    </header>
  );
}
