"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatBox from "./components/ChatBox";
import Suggestions from "./components/Suggestions";
import Documents from "./components/Documents";
import Search from "./components/Search";
import Settings from "./components/Settings";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [activePage, setActivePage] = useState("chat");
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeChatIdRef = useRef(null);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;

        setUserId(
          session?.user?.id || null
        );
      }
    );

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active) {
          setUserId(
            data?.user?.id || null
          );
        }
      })
      .catch(() => {
        if (active) {
          setUserId(null);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!userId) {
      Promise.resolve()
        .then(() => {
          if (!active) return;

          setChats([]);
          setActiveChatId(null);
          setMessages([]);
          setFeedback({});
          setHydrated(false);
          activeChatIdRef.current = null;
        });

      return () => {
        active = false;
      };
    }

    const key = `aveniq-chats-${userId}`;

    Promise.resolve()
      .then(() => {
        return localStorage.getItem(
          key
        );
      })
      .then((savedChats) => {
        if (!active) return;

        if (savedChats) {
          try {
            setChats(
              JSON.parse(savedChats)
            );
          } catch (error) {
            console.error(
              "CHAT HISTORY ERROR:",
              error
            );
          }
        }

        setHydrated(true);
      })
      .catch((error) => {
        console.error(
          "CHAT HISTORY ERROR:",
          error
        );
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!hydrated || !userId) return;

    localStorage.setItem(
      `aveniq-chats-${userId}`,
      JSON.stringify(chats)
    );
  }, [chats, hydrated, userId]);

  function createNewChat() {
    setMessage("");
    setMessages([]);
    setFeedback({});
    setActivePage("chat");
    setActiveChatId(null);
    activeChatIdRef.current = null;
  }

  function handleMessagesChange(updatedMessages) {
    setMessages((current) => {
      const nextMessages =
        typeof updatedMessages === "function"
          ? updatedMessages(current)
          : updatedMessages;

      const firstUserMessage = nextMessages.find(
        (item) => item.role === "user"
      );

      if (!firstUserMessage) {
        return nextMessages;
      }

      const currentChatId = activeChatIdRef.current;

      if (!currentChatId) {
        const newChatId = crypto.randomUUID();

        const newChat = {
          id: newChatId,
          title: firstUserMessage.content.slice(0, 40),
          messages: nextMessages,
        };

        activeChatIdRef.current = newChatId;
        setActiveChatId(newChatId);

        setChats((currentChats) => [
          newChat,
          ...currentChats,
        ]);

        return nextMessages;
      }

      setChats((currentChats) =>
        currentChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: nextMessages,
              }
            : chat
        )
      );

      return nextMessages;
    });
  }

  function openChat(chat) {
    setActivePage("chat");
    setActiveChatId(chat.id);
    activeChatIdRef.current = chat.id;
    setMessages(chat.messages);
    setMessage("");
    setFeedback({});
  }

  function clearChat() {
    setMessages([]);
    setMessage("");
    setFeedback({});
  }

  function deleteChat(chatId) {
    setChats((currentChats) =>
      currentChats.filter(
        (chat) => chat.id !== chatId
      )
    );

    if (activeChatIdRef.current === chatId) {
      setMessages([]);
      setMessage("");
      setFeedback({});
      setActiveChatId(null);
      setActivePage("chat");
      activeChatIdRef.current = null;
    }
  }

  function renderPage() {
    if (activePage === "documents") {
      return (
        <Documents
          onToggleSidebar={() => setSidebarOpen(true)}
        />
      );
    }

    if (activePage === "search") {
      return (
        <Search
          onToggleSidebar={() => setSidebarOpen(true)}
        />
      );
    }

    if (activePage === "settings") {
      return (
        <Settings
          onToggleSidebar={() => setSidebarOpen(true)}
        />
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <ChatHeader
          onNewChat={createNewChat}
          onClearChat={clearChat}
          onOpenSettings={() =>
            setActivePage("settings")
          }
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#2563EB]/[0.035] blur-3xl" />

            <div className="absolute bottom-[-220px] right-[-160px] h-[360px] w-[360px] rounded-full bg-[#60A5FA]/[0.025] blur-3xl" />
          </div>

          <div className="relative flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col justify-center py-8">
                  <div className="mx-auto w-full max-w-3xl">
                    <div className="mb-8 text-center sm:mb-10">
                      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DBEAFE] bg-white shadow-[0_8px_30px_rgba(37,99,235,0.08)] sm:h-16 sm:w-16">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB] text-[11px] font-bold tracking-wide text-white shadow-sm sm:h-9 sm:w-9">
                          AI
                        </div>
                      </div>

                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                        AVENIQ Intelligence
                      </p>

                      <h1 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#0F172A] sm:text-2xl lg:text-3xl">
                        Real Estate Intelligence
                      </h1>

                      <p className="mx-auto mt-3 max-w-lg px-2 text-sm leading-6 text-[#64748B]">
                        Ask questions, analyze properties,
                        and explore your real estate
                        knowledge with AVENIQ.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                      <ChatBox
                        messages={messages}
                        setMessages={handleMessagesChange}
                        message={message}
                        setMessage={setMessage}
                        feedback={feedback}
                        setFeedback={setFeedback}
                      />
                    </div>

                    {!message && (
                      <Suggestions
                        onSelect={setMessage}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-full flex-col">
                  <ChatBox
                    messages={messages}
                    setMessages={handleMessagesChange}
                    message={message}
                    setMessage={setMessage}
                    feedback={feedback}
                    setFeedback={setFeedback}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-white text-[#0F172A]">
      <div className="hidden lg:block">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          onNewChat={createNewChat}
          chats={chats}
          activeChatId={activeChatId}
          onOpenChat={openChat}
          onDeleteChat={deleteChat}
        />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => {
            setActivePage(page);
            setSidebarOpen(false);
          }}
          onNewChat={() => {
            createNewChat();
            setSidebarOpen(false);
          }}
          chats={chats}
          activeChatId={activeChatId}
          onOpenChat={(chat) => {
            openChat(chat);
            setSidebarOpen(false);
          }}
          onDeleteChat={deleteChat}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div
          key={activePage}
          className="flex min-h-0 flex-1 animate-[pageEnter_220ms_ease-out]"
        >
          {renderPage()}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        ::selection {
          background: #dbeafe;
          color: #1e3a8a;
        }
      `}</style>
    </main>
  );
}
