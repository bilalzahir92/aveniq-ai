"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const navigation = [
  {
    id: "chat",
    label: "Chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.7-.8L4 20l1.4-3.5A7.4 7.4 0 0 1 4.5 12 7.5 7.5 0 1 1 20 11.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "documents",
    label: "Documents",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M14 3.5V8h4M10 12h4M10 15.5h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "search",
    label: "Search",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <circle
          cx="10.8"
          cy="10.8"
          r="6.3"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="m16 16 4.2 4.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M9.2 4.5h5.6M9.2 19.5h5.6M4.5 9.2v5.6M19.5 9.2v5.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <rect
          x="7"
          y="7"
          width="10"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
];

export default function Sidebar({
  activePage,
  setActivePage,
  onNewChat,
  chats,
  activeChatId,
  onOpenChat,
  onDeleteChat,
}) {
  const [menuId, setMenuId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUserEmail(
          data?.user?.email || ""
        );
      })
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await supabase.auth.signOut();

      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  function handleDelete(chatId) {
    setMenuId(null);
    onDeleteChat(chatId);
  }

  return (
    <aside
      onClick={() => menuId && setMenuId(null)}
      className="flex h-full w-64 shrink-0 flex-col border-r border-[#E2E8F0] bg-white text-[#0F172A]"
    >
      <div className="flex h-16 shrink-0 items-center border-b border-[#E2E8F0] px-5">
        <button
          type="button"
          onClick={() => setActivePage("chat")}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] transition-all duration-200 group-hover:border-[#BFDBFE] group-hover:bg-[#E0EDFF] group-hover:shadow-sm">
            <span className="text-[11px] font-bold tracking-tight text-[#2563EB]">
              A
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              AVENIQ
            </span>

            <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#2563EB]">
              AI
            </span>
          </div>
        </button>
      </div>

      <div className="px-4 py-4">
        <button
          type="button"
          onClick={onNewChat}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-[0_6px_18px_rgba(37,99,235,0.16)] active:scale-[0.98]"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90"
          >
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>

          New Chat
        </button>
      </div>

      <nav className="px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#94A3B8]">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const active = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#EFF6FF] text-[#1D4ED8]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155]"
                }`}
              >
                <span
                  className={`transition-transform duration-200 group-hover:scale-105 ${
                    active
                      ? "text-[#2563EB]"
                      : "text-[#94A3B8] group-hover:text-[#64748B]"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {active && (
                  <span className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-3">
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#94A3B8]">
            Recent
          </p>

          {chats.length > 0 && (
            <span className="rounded-md bg-[#F8FAFC] px-1.5 py-0.5 text-[10px] font-medium text-[#94A3B8]">
              {chats.length}
            </span>
          )}
        </div>

        {chats.length === 0 ? (
          <div className="mx-2 mt-2 rounded-xl border border-dashed border-[#E2E8F0] bg-[#FAFAFA] px-4 py-6 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#94A3B8]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M6 7.5A2.5 2.5 0 0 1 8.5 5h7A2.5 2.5 0 0 1 18 7.5v5a2.5 2.5 0 0 1-2.5 2.5H11l-4 3v-3.5A2.5 2.5 0 0 1 4.5 12V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="mt-3 text-[11px] font-medium text-[#64748B]">
              No recent chats
            </p>

            <p className="mt-1 text-[10px] leading-4 text-[#94A3B8]">
              Start a new conversation to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="group relative"
              >
                <button
                  type="button"
                  onClick={() => onOpenChat(chat)}
                  className={`w-full truncate rounded-xl px-3 py-2.5 pr-10 text-left text-[12px] transition-all duration-200 ${
                    activeChatId === chat.id
                      ? "bg-[#F1F5F9] font-medium text-[#1E293B]"
                      : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155]"
                  }`}
                >
                  {chat.title}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuId(
                      menuId === chat.id
                        ? null
                        : chat.id
                    );
                  }}
                  className={`absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg transition-all duration-150 ${
                    menuId === chat.id
                      ? "bg-[#E2E8F0] text-[#334155]"
                      : "text-[#CBD5E1] opacity-0 group-hover:opacity-100 hover:bg-[#F1F5F9] hover:text-[#475569]"
                  }`}
                  aria-label="Chat options"
                >
                  <span className="mb-1 tracking-[0.1em]">
                    ···
                  </span>
                </button>

                {menuId === chat.id && (
                  <div
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="absolute right-1 top-10 z-30 w-36 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-[0_12px_35px_rgba(15,23,42,0.12)] animate-[menuIn_140ms_ease-out]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(chat.id)
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          d="M5.5 7v8.5h9V7M4 5.5h12M8 5.5V4h4v1.5M8 9v4M12 9v4"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E2E8F0] p-3">
        <div className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-200 hover:bg-[#F8FAFC]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DBEAFE] bg-[#EFF6FF] text-[11px] font-semibold text-[#2563EB]">
            {userEmail
              ? userEmail
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-[#334155]">
              {userEmail || "Account"}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-[#94A3B8]">
              AVENIQ AI
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition-all duration-200 hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-50"
          >
            {signingOut ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-500" />
            ) : (
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5V7M10.5 13h6m0 0-2-2m2 2-2 2M3 15.5A1.5 1.5 0 0 0 4.5 17h7a1.5 1.5 0 0 0 1.5-1.5V14"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes menuIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </aside>
  );
}