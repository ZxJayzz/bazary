"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  otherUser: {
    id: string;
    name: string;
    image: string | null;
  };
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export default function ChatPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "fr";
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Transform raw API conversation to our interface
  const transformConversations = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rawConversations: any[]): Conversation[] => {
      const userId = session?.user?.id;
      if (!userId) return [];
      return rawConversations.map((conv) => {
        const otherUser = conv.buyerId === userId ? conv.seller : conv.buyer;
        const lastMsg = conv.messages?.[0];
        const images = conv.product?.images ? JSON.parse(conv.product.images) : [];
        const unread = lastMsg && !lastMsg.read && lastMsg.senderId !== userId ? 1 : 0;
        return {
          id: conv.id,
          productId: conv.productId,
          productTitle: conv.product?.title || "",
          productImage: images[0] || "",
          otherUser: {
            id: otherUser?.id || "",
            name: otherUser?.name || "",
            image: otherUser?.image || null,
          },
          lastMessage: lastMsg?.content || "",
          lastMessageAt: lastMsg?.createdAt || conv.updatedAt,
          unreadCount: unread,
        };
      });
    },
    [session?.user?.id]
  );

  // Fetch conversations
  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        const raw = Array.isArray(data) ? data : data.conversations || [];
        setConversations(transformConversations(raw));
        setLoadingConversations(false);
      })
      .catch(() => {
        showToast("Erreur de chargement des conversations", "error");
        setLoadingConversations(false);
      });
  }, [session?.user?.id, transformConversations]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(
    (conversationId: string) => {
      if (!conversationId) return;
      fetch(`/api/conversations/${conversationId}/messages`)
        .then((res) => res.json())
        .then((data) => {
          setMessages(data.messages || []);
          setLoadingMessages(false);
          setTimeout(scrollToBottom, 100);
        })
        .catch(() => setLoadingMessages(false));
    },
    []
  );

  useEffect(() => {
    if (!selectedId) return;
    setLoadingMessages(true);
    fetchMessages(selectedId);
  }, [selectedId, fetchMessages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!selectedId) return;

    const interval = setInterval(() => {
      fetchMessages(selectedId);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedId, fetchMessages]);

  // Poll conversations for unread counts
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(() => {
      fetch("/api/conversations")
        .then((res) => res.json())
        .then((data) => {
          const raw = Array.isArray(data) ? data : data.conversations || [];
          setConversations(transformConversations(raw));
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [session?.user?.id, transformConversations]);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setMobileShowChat(true);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);

    // Optimistic UI: add message immediately
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedId,
      senderId: session?.user?.id || "",
      content: messageContent,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (res.ok) {
        fetchMessages(selectedId);
      } else {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        setNewMessage(messageContent);
        showToast("Erreur d'envoi du message", "error");
      }
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setNewMessage(messageContent);
      showToast("Erreur d'envoi du message", "error");
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          {locale === "mg" ? "Mila miditra aloha ianao" : "Connexion requise"}
        </h1>
        <p className="text-gray-500 mb-6">
          {locale === "mg"
            ? "Mila miditra ianao vao afaka mijery ny resaka"
            : "Vous devez vous connecter pour acceder aux messages"}
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
        >
          {t("common.login")}
        </Link>
      </div>
    );
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {locale === "mg" ? "Resaka" : "Messages"}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-[calc(100dvh-260px)] lg:h-[calc(100dvh-200px)]">
        <div className="flex h-full">
          {/* Conversation list - hidden on mobile when chat is open */}
          <div
            className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${
              mobileShowChat ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-3 border-b border-gray-200">
              <h2 className="font-medium text-gray-800 text-sm">
                {locale === "mg" ? "Resaka" : "Conversations"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 80 80">
                    <rect x="8" y="16" width="44" height="32" rx="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <rect x="28" y="32" width="44" height="32" rx="8" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-gray-300" />
                    <circle cx="22" cy="32" r="2" fill="currentColor" />
                    <circle cx="30" cy="32" r="2" fill="currentColor" />
                    <circle cx="38" cy="32" r="2" fill="currentColor" />
                  </svg>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {locale === "mg"
                      ? "Tsy mbola misy resaka"
                      : "Aucune conversation"}
                  </p>
                  <p className="text-gray-400 text-xs mb-4">
                    {locale === "mg"
                      ? "Ny resaka ataonao ho hita eto"
                      : "Vos conversations appara\u00eetront ici"}
                  </p>
                  <Link
                    href={`/${locale}/buy-sell`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {locale === "mg" ? "Hijery entana" : "Parcourir les annonces"}
                  </Link>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedId === conv.id ? "bg-primary/5 border-r-2 border-primary" : ""
                    }`}
                  >
                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={conv.productImage || "/images/placeholder.svg"}
                        alt={conv.productTitle}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {conv.otherUser.name}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {timeAgo(conv.lastMessageAt, locale)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{conv.productTitle}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message area - hidden on mobile when list is showing */}
          <div
            className={`flex-1 flex flex-col ${
              mobileShowChat ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Chat header */}
                <div className="p-3 border-b border-gray-200 flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={selectedConversation.productImage || "/images/placeholder.svg"}
                      alt={selectedConversation.productTitle}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {selectedConversation.otherUser.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedConversation.productTitle}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">
                        {locale === "mg"
                          ? "Manomboka resaka..."
                          : "Commencez la conversation..."}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === session.user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                              isOwn
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-gray-100 text-gray-800 rounded-bl-md"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isOwn ? "text-white/70" : "text-gray-400"
                              }`}
                            >
                              {timeAgo(msg.createdAt, locale)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-gray-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      locale === "mg" ? "Soraty ny hafatrao..." : "Tapez votre message..."
                    }
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-4">
                  <svg className="w-20 h-20 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 80 80">
                    <rect x="8" y="16" width="44" height="32" rx="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <rect x="28" y="32" width="44" height="32" rx="8" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-gray-300" />
                    <circle cx="22" cy="32" r="2" fill="currentColor" />
                    <circle cx="30" cy="32" r="2" fill="currentColor" />
                    <circle cx="38" cy="32" r="2" fill="currentColor" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-1">
                    {locale === "mg"
                      ? "Misafidiana resaka iray"
                      : "S\u00e9lectionnez une conversation"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {locale === "mg"
                      ? "Ny resaka ataonao ho hita eto"
                      : "Vos conversations appara\u00eetront ici"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
