"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface SessionUser {
  id: string;
  name: string;
  role: string;
}

interface ConvUser {
  id: string;
  name: string;
  image?: string;
}

interface Conversation {
  id: string;
  clientId: string;
  artisanId: string;
  client: ConvUser;
  artisan: ConvUser;
  messages: Message[];
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

function MessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeConvRef = useRef<Conversation | null>(null);
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conversationId");

  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  // Fetch Session User
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.role) {
          fetch("/api/session")
            .then((r) => r.json())
            .then((s) => {
              if (s.userId) {
                setSessionUser({ id: s.userId, name: data.name, role: data.role });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Deep Link Conversation
  useEffect(() => {
    if (initialConvId) {
      const targetConv = conversations.find((c) => c.id === initialConvId);
      if (targetConv) {
        if (activeConversation?.id !== targetConv.id) {
          loadConversation(targetConv);
        }
      } else if (!loading) {
        fetch(`/api/messages/${initialConvId}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.conversation) {
              const conv = data.conversation as Conversation;
              setActiveConversation(conv);
              setMessages(data.messages || []);
              setMobileView("chat");
              setConversations((prev) => {
                if (prev.some((c) => c.id === conv.id)) return prev;
                return [conv, ...prev];
              });
            }
          })
          .catch(() => {});
      }
    }
  }, [conversations, initialConvId, loading]);

  // Polling every 6 seconds for real-time update feel
  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      const conv = activeConvRef.current;
      if (conv) {
        try {
          const res = await fetch(`/api/messages/${conv.id}`);
          const data = await res.json();
          if (data.success) {
            setMessages(data.messages);
          }
        } catch {}
      }
      fetchConversations();
    }, 6000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    setMobileView("chat");
    try {
      const res = await fetch(`/api/messages/${conv.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setTimeout(() => scrollToBottom(), 100);
        await fetch("/api/messages/unread", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: conv.id }),
        });
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeConversation || sending) return;

    const msgContent = content.trim();
    setSending(true);
    setContent("");

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: sessionUser?.id || "me",
      content: msgContent,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await fetch(`/api/messages/${activeConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msgContent }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data.message : m)));
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setContent(msgContent);
    } finally {
      setSending(false);
    }
  };

  const getOtherPerson = (conv: Conversation): ConvUser => {
    if (!sessionUser) return conv.artisan;
    return sessionUser.id === conv.clientId ? conv.artisan : conv.client;
  };

  const isMyMessage = (msg: Message): boolean => {
    return msg.senderId === sessionUser?.id || msg.senderId === "me";
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return "اليوم";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "الأمس";
    return d.toLocaleDateString("ar-DZ", { day: "numeric", month: "short" });
  };

  const filteredConversations = conversations.filter((c) => {
    const other = getOtherPerson(c);
    const matchName = other.name.toLowerCase().includes(searchQuery.toLowerCase());
    const lastMsg = c.messages[0]?.content || "";
    const matchMsg = lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
    return matchName || matchMsg;
  });

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem", color: "#6A7A8A" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }} className="animate-pulse">💬</div>
        <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0F4F8" }}>جاري تحميل المحادثات...</p>
      </div>
    );

  return (
    <div
      className="messages-wrapper"
      style={{
        display: "flex",
        height: "calc(100vh - 120px)",
        maxHeight: "850px",
        background: "#131820",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
        border: "1px solid rgba(217,162,100,0.18)",
      }}
    >
      {/* ── LIST SIDEBAR ── */}
      <div
        className={`conversations-sidebar ${mobileView === "chat" ? "hide-on-mobile" : ""}`}
        style={{
          width: "340px",
          borderLeft: "1px solid rgba(217,162,100,0.12)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          background: "#0B0D12",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem 0.85rem",
            borderBottom: "1px solid rgba(217,162,100,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#F0F4F8", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>💬</span> الرسائل
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                background: "rgba(217,162,100,0.12)",
                color: "#D9A264",
                padding: "0.2rem 0.6rem",
                borderRadius: "12px",
                border: "1px solid rgba(217,162,100,0.2)",
              }}
            >
              {conversations.length} محادثة
            </span>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="ابحث عن محادثة أو حرفي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem 1rem 0.7rem 2.2rem",
                borderRadius: "14px",
                border: "1px solid rgba(217,162,100,0.18)",
                background: "#131820",
                color: "#F0F4F8",
                fontSize: "0.88rem",
                outline: "none",
                fontFamily: "'Cairo', sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#D9A264")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(217,162,100,0.18)")}
            />
            <span
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.85rem",
                color: "#6A7A8A",
              }}
            >
              🔍
            </span>
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
          {filteredConversations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#6A7A8A",
                marginTop: "3rem",
                padding: "0 1rem",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
              <p style={{ fontWeight: 800, fontSize: "0.95rem", color: "#F0F4F8" }}>
                {searchQuery ? "لا توجد نتائج بحث" : "لا توجد محادثات بعد"}
              </p>
              <p style={{ fontSize: "0.8rem", marginTop: "0.4rem", color: "#A7B8C4" }}>
                {searchQuery ? "جرّب البحث باسم آخر" : "تواصل مع الحرفيين عبر صفحة الخريطة"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = getOtherPerson(conv);
              const lastMsg = conv.messages[0];
              const isActive = activeConversation?.id === conv.id;
              const hasUnread = lastMsg && !lastMsg.isRead && !isMyMessage(lastMsg);

              return (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  style={{
                    padding: "0.95rem 1rem",
                    borderRadius: "16px",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(217,162,100,0.15), rgba(217,162,100,0.06))"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(217,162,100,0.3)"
                      : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginBottom: "0.4rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "rgba(217,162,100,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Avatar with status indicator */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: other.image
                          ? `url(${other.image}) center/cover`
                          : "linear-gradient(135deg, #D9A264, #8B5E2A)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0D0F14",
                        fontWeight: 900,
                        fontSize: "1.1rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      }}
                    >
                      {!other.image && other.name.charAt(0)}
                    </div>
                    {/* Active Status Dot */}
                    <span
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        left: "2px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "2px solid #0B0D12",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.2rem" }}>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#F0F4F8",
                          fontSize: "0.95rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {other.name}
                      </div>
                      {lastMsg && (
                        <span style={{ fontSize: "0.7rem", color: "#6A7A8A", fontWeight: 700, flexShrink: 0 }}>
                          {formatDate(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: hasUnread ? "#D9A264" : "#A7B8C4",
                        fontWeight: hasUnread ? 800 : 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{lastMsg?.content || "ابدأ المحادثة..."}</span>
                      {hasUnread && (
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#D9A264",
                            display: "inline-block",
                            marginRight: "6px",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── CHAT MAIN PANEL ── */}
      <div
        className={`chat-panel ${mobileView === "list" ? "hide-on-mobile" : ""}`}
        style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#131820" }}
      >
        {activeConversation ? (
          <>
            {/* Chat Top Bar */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid rgba(217,162,100,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#0B0D12",
              }}
            >
              {(() => {
                const other = getOtherPerson(activeConversation);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    {/* Back Button (Mobile) */}
                    <button
                      onClick={() => setMobileView("list")}
                      className="mobile-back-btn"
                      style={{
                        display: "none",
                        background: "rgba(217,162,100,0.1)",
                        border: "1px solid rgba(217,162,100,0.2)",
                        color: "#D9A264",
                        borderRadius: "10px",
                        padding: "0.4rem 0.75rem",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      ← المحادثات
                    </button>

                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: other.image
                            ? `url(${other.image}) center/cover`
                            : "linear-gradient(135deg, #D9A264, #8B5E2A)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#0D0F14",
                          fontWeight: 900,
                          fontSize: "1.1rem",
                          flexShrink: 0,
                        }}
                      >
                        {!other.image && other.name.charAt(0)}
                      </div>
                      <span
                        style={{
                          position: "absolute",
                          bottom: "0px",
                          left: "0px",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "#22c55e",
                          border: "2px solid #0B0D12",
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ fontWeight: 900, color: "#F0F4F8", fontSize: "1.05rem" }}>
                        {other.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#4ade80", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>•</span> نشط الآن
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  title="اتصال تلفوني"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    border: "1px solid rgba(217,162,100,0.18)",
                    background: "rgba(217,162,100,0.06)",
                    color: "#D9A264",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  📞
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(217,162,100,0.03) 0%, transparent 80%)",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6A7A8A",
                    marginTop: "4rem",
                    fontSize: "0.95rem",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>💬</div>
                  لا توجد رسائل بعد. ابدأ المحادثة الآن! 👋
                </div>
              )}

              {messages.map((msg, i) => {
                const mine = isMyMessage(msg);
                const showDate =
                  i === 0 ||
                  new Date(msg.createdAt).toDateString() !==
                    new Date(messages[i - 1].createdAt).toDateString();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "0.72rem",
                          color: "#6A7A8A",
                          margin: "0.75rem 0",
                          fontWeight: 800,
                        }}
                      >
                        <span style={{
                          background: "#0B0D12",
                          padding: "0.25rem 0.85rem",
                          borderRadius: "12px",
                          border: "1px solid rgba(217,162,100,0.1)",
                        }}>
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: mine ? "flex-start" : "flex-end",
                        alignItems: "flex-end",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "0.85rem 1.25rem",
                          borderRadius: mine ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
                          background: mine
                            ? "linear-gradient(135deg, #D9A264, #A97B3C)"
                            : "#1B222C",
                          color: mine ? "#0D0F14" : "#F0F4F8",
                          boxShadow: mine
                            ? "0 4px 20px rgba(217,162,100,0.25)"
                            : "0 4px 16px rgba(0,0,0,0.3)",
                          border: mine ? "none" : "1px solid rgba(255,255,255,0.08)",
                          wordBreak: "break-word",
                          opacity: msg.id.startsWith("temp-") ? 0.7 : 1,
                          transition: "opacity 0.3s",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.55, fontWeight: 600 }}>
                          {msg.content}
                        </p>
                        <div
                          style={{
                            fontSize: "0.68rem",
                            marginTop: "0.4rem",
                            opacity: mine ? 0.85 : 0.6,
                            fontWeight: 700,
                            textAlign: mine ? "left" : "right",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: mine ? "flex-start" : "flex-end",
                            gap: "0.3rem",
                          }}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                          {mine && (
                            <span style={{ color: "#0D0F14", fontWeight: 900 }}>
                              {msg.isRead ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid rgba(217,162,100,0.12)",
                background: "#0B0D12",
              }}
            >
              <form
                onSubmit={sendMessage}
                style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: "0.85rem 1.25rem",
                    borderRadius: "16px",
                    border: "1.5px solid rgba(217,162,100,0.2)",
                    outline: "none",
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "0.95rem",
                    background: "#131820",
                    transition: "border-color 0.2s",
                    color: "#F0F4F8",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#D9A264")}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(217,162,100,0.2)")
                  }
                />

                <button
                  type="submit"
                  disabled={!content.trim() || sending}
                  style={{
                    padding: "0.85rem 1.5rem",
                    borderRadius: "16px",
                    background:
                      !content.trim() || sending
                        ? "rgba(217,162,100,0.12)"
                        : "linear-gradient(135deg, #D9A264, #A97B3C)",
                    color: !content.trim() || sending ? "#6A7A8A" : "#0D0F14",
                    border: "none",
                    fontWeight: 900,
                    fontSize: "0.95rem",
                    cursor: !content.trim() || sending ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    flexShrink: 0,
                    boxShadow:
                      !content.trim() || sending ? "none" : "0 4px 16px rgba(217,162,100,0.25)",
                  }}
                >
                  {sending ? "..." : "إرسال 🚀"}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty Chat state */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#6A7A8A",
              gap: "1.25rem",
              padding: "2rem",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "rgba(217,162,100,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3.5rem",
                border: "1px solid rgba(217,162,100,0.15)",
              }}
            >
              💬
            </div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#F0F4F8", marginBottom: "0.4rem" }}>
                مراسلات حِرَفي المباشرة
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#A7B8C4", maxWidth: "300px", margin: "0 auto" }}>
                اختر محادثة من القائمة على اليسار للتواصل المباشر مع الحرفيين والعملاء
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .messages-wrapper {
            height: calc(100vh - 120px) !important;
            border-radius: 16px !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .conversations-sidebar {
            width: 100% !important;
            border-left: none !important;
          }
          .chat-panel {
            width: 100% !important;
          }
          .mobile-back-btn {
            display: inline-block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "6rem", color: "#6A7A8A" }}>
          <p style={{ fontWeight: 800, color: "#F0F4F8" }}>جاري تحميل الرسائل...</p>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
