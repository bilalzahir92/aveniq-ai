"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatBox from "./components/ChatBox";
import Suggestions from "./components/Suggestions";
import Documents from "./components/Documents";
import Search from "./components/Search";
import Settings from "./components/Settings";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [activePage, setActivePage] = useState("chat");

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const activeChatIdRef = useRef(null);

  useEffect(() => {
    const savedChats = localStorage.getItem("aveniq-chats");

    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (error) {
        console.error("CHAT HISTORY ERROR:", error);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem("aveniq-chats", JSON.stringify(chats));
  }, [chats, hydrated]);

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
        setChats((currentChats) => [newChat, ...currentChats]);

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

  function deleteChat(chatId) {
    setChats((currentChats) =>
      currentChats.filter((chat) => chat.id !== chatId)
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

  return (
    <main className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#111827]">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onNewChat={createNewChat}
        chats={chats}
        activeChatId={activeChatId}
        onOpenChat={openChat}
        onDeleteChat={deleteChat}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {activePage === "documents" ? (
          <Documents />
        ) : activePage === "search" ? (
          <Search />
        ) : activePage === "settings" ? (
          <Settings />
        ) : (
          <>
            <ChatHeader />

            <section className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center px-6 py-12">
                  {messages.length === 0 && (
                    <div className="mb-8 text-center">
                      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-sm font-semibold text-[#2563EB] ring-1 ring-[#DBEAFE]">
                        AI
                      </div>

                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#64748B]">
                        AVENIQ Intelligence
                      </p>

                      <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">
                        Real Estate Intelligence
                      </h1>

                      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#64748B]">
                        Ask questions, analyze properties, and explore your
                        real estate knowledge.
                      </p>
                    </div>
                  )}

                  <ChatBox
                    messages={messages}
                    setMessages={handleMessagesChange}
                    message={message}
                    setMessage={setMessage}
                    feedback={feedback}
                    setFeedback={setFeedback}
                  />

                  {!message && messages.length === 0 && (
                    <Suggestions onSelect={setMessage} />
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}