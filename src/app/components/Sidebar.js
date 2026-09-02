import { useState } from "react";

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

  function handleDelete(chatId) {
    setMenuId(null);
    onDeleteChat(chatId);
  }

  return (
    <aside
      onClick={() => menuId && setMenuId(null)}
      className="flex h-screen w-64 flex-col border-r border-[#E2E8F0] bg-[#0F172A] text-white"
    >
      <div className="flex h-16 items-center border-b border-[#1E293B] px-6">
        <h1 className="text-lg font-semibold tracking-tight">
          AVENIQ<span className="text-[#2563EB]"> AI</span>
        </h1>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          + New Chat
        </button>
      </div>

      <nav className="px-3">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#64748B]">
          Workspace
        </p>

        <button
          type="button"
          onClick={() => setActivePage("chat")}
          className={`mb-1 flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            activePage === "chat"
              ? "bg-[#1E293B] text-white"
              : "text-[#94A3B8] hover:bg-[#172033] hover:text-white"
          }`}
        >
          Chat
        </button>

        <button
          type="button"
          onClick={() => setActivePage("documents")}
          className={`mb-1 flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            activePage === "documents"
              ? "bg-[#1E293B] text-white"
              : "text-[#94A3B8] hover:bg-[#172033] hover:text-white"
          }`}
        >
          Documents
        </button>

        <button
          type="button"
          onClick={() => setActivePage("search")}
          className={`mb-1 flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            activePage === "search"
              ? "bg-[#1E293B] text-white"
              : "text-[#94A3B8] hover:bg-[#172033] hover:text-white"
          }`}
        >
          Search
        </button>

        <button
          type="button"
          onClick={() => setActivePage("settings")}
          className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            activePage === "settings"
              ? "bg-[#1E293B] text-white"
              : "text-[#94A3B8] hover:bg-[#172033] hover:text-white"
          }`}
        >
          Settings
        </button>
      </nav>

      <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-3">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#64748B]">
          Recent
        </p>

        {chats.length === 0 ? (
          <p className="px-3 py-2 text-xs text-[#64748B]">
            No recent chats
          </p>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div key={chat.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onOpenChat(chat)}
                  className={`w-full truncate rounded-lg px-3 py-2.5 pr-9 text-left text-sm transition ${
                    activeChatId === chat.id
                      ? "bg-[#1E293B] text-white"
                      : "text-[#94A3B8] hover:bg-[#172033] hover:text-white"
                  }`}
                >
                  {chat.title}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuId(menuId === chat.id ? null : chat.id);
                  }}
                  className={`absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-lg leading-none transition ${
                    menuId === chat.id
                      ? "bg-[#334155] text-white"
                      : "text-[#64748B] opacity-0 group-hover:opacity-100 hover:bg-[#334155] hover:text-white"
                  }`}
                  aria-label="Chat options"
                >
                  ⋯
                </button>

                {menuId === chat.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-1 top-10 z-20 w-32 rounded-lg border border-[#334155] bg-[#1E293B] p-1 shadow-xl"
                  >
                    <button
                      type="button"
                      onClick={() => handleDelete(chat.id)}
                      className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-red-400 transition hover:bg-[#334155] hover:text-red-300"
                    >
                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#1E293B] p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E293B] text-sm font-medium text-[#60A5FA]">
            U
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              User
            </p>

            <p className="truncate text-xs text-[#64748B]">
              Real Estate Team
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}