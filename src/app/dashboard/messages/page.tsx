"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeConvRef = useRef<Conversation | null>(null);

  // مزامنة activeConversation مع ref لاستخدامها في الـ polling
  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  // جلب معلومات المستخدم الحالي
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.role) {
          // نحتاج الـ id — نجلبه من session endpoint
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

  // جلب المحادثات
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

  // Polling — تحديث الرسائل كل 8 ثوانٍ
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
    }, 8000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    try {
      const res = await fetch(`/api/messages/${conv.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setTimeout(() => scrollToBottom(), 100);
        // تعيين الرسائل كمقروءة
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

    // رسالة مؤقتة فورية
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: sessionUser?.id || "me",
      content: msgContent,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => scrollToBottom(), 100);

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
      // إزالة الرسالة المؤقتة عند الخطأ
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setContent(msgContent);
    } finally {
      setSending(false);
    }
  };

  // اسم الطرف الآخر في المحادثة
  const getOtherPerson = (conv: Conversation): ConvUser => {
    if (!sessionUser) return conv.artisan;
    return sessionUser.id === conv.clientId ? conv.artisan : conv.client;
  };

  // هل الرسالة مني؟
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
    return d.toLocaleDateString("ar-DZ", { day: "numeric", month: "short" });
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💬</div>
        <p style={{ fontWeight: 700 }}>جاري تحميل الرسائل...</p>
      </div>
    );

  return (
    <div
      className="messages-layout"
      style={{
        display: "flex",
        height: "calc(100vh - 130px)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(26,18,8,0.08)",
        border: "1px solid rgba(200,149,108,0.15)",
      }}
    >
      {/* ── قائمة المحادثات ── */}
      <div
        className="conversations-sidebar"
        style={{
          width: "300px",
          borderLeft: "1px solid rgba(200,149,108,0.18)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(200,149,108,0.15)",
            background: "rgba(255,255,255,0.6)",
          }}
        >
          <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--dark)" }}>
            💬 المحادثات
          </h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
          {conversations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--muted)",
                marginTop: "3rem",
                padding: "0 1rem",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
              <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>لا توجد محادثات بعد</p>
              <p style={{ fontSize: "0.82rem", marginTop: "0.4rem" }}>
                ابدأ بالتواصل مع حرفي من صفحة الخريطة
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherPerson(conv);
              const lastMsg = conv.messages[0];
              const isActive = activeConversation?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "14px",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(181,83,26,0.1), rgba(181,83,26,0.05))"
                      : "transparent",
                    border: isActive
                      ? "1.5px solid rgba(181,83,26,0.2)"
                      : "1.5px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginBottom: "0.35rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "rgba(181,83,26,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* أفاتار */}
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: other.image
                        ? `url(${other.image}) center/cover`
                        : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {!other.image && other.name.charAt(0)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "var(--dark)",
                        fontSize: "0.92rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {other.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginTop: "0.15rem",
                      }}
                    >
                      {lastMsg?.content || "ابدأ المحادثة..."}
                    </div>
                  </div>

                  {lastMsg && (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--muted)",
                        flexShrink: 0,
                        alignSelf: "flex-start",
                      }}
                    >
                      {formatDate(lastMsg.createdAt)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── منطقة الدردشة ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {activeConversation ? (
          <>
            {/* رأس المحادثة */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid rgba(200,149,108,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "rgba(255,255,255,0.6)",
              }}
            >
              {(() => {
                const other = getOtherPerson(activeConversation);
                return (
                  <>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: other.image
                          ? `url(${other.image}) center/cover`
                          : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      {!other.image && other.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: "var(--dark)", fontSize: "1rem" }}>
                        {other.name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {sessionUser?.role === "CLIENT" ? "حرفي" : "مواطن"}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* الرسائل */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    marginTop: "3rem",
                    fontSize: "0.9rem",
                  }}
                >
                  لا توجد رسائل بعد. ابدأ المحادثة! 👋
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
                          color: "var(--muted)",
                          margin: "0.5rem 0",
                          fontWeight: 700,
                        }}
                      >
                        ── {formatDate(msg.createdAt)} ──
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
                          maxWidth: "70%",
                          padding: "0.75rem 1.1rem",
                          borderRadius: mine ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
                          background: mine
                            ? "linear-gradient(135deg, var(--terracotta), #d45e1a)"
                            : "rgba(245,237,216,0.9)",
                          color: mine ? "#fff" : "var(--dark)",
                          boxShadow: mine
                            ? "0 4px 16px rgba(181,83,26,0.25)"
                            : "0 2px 8px rgba(26,18,8,0.06)",
                          border: mine ? "none" : "1px solid rgba(200,149,108,0.2)",
                          wordBreak: "break-word",
                          opacity: msg.id.startsWith("temp-") ? 0.7 : 1,
                          transition: "opacity 0.3s",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.55 }}>
                          {msg.content}
                        </p>
                        <div
                          style={{
                            fontSize: "0.68rem",
                            marginTop: "0.35rem",
                            opacity: 0.7,
                            textAlign: mine ? "left" : "right",
                          }}
                        >
                          {formatTime(msg.createdAt)}
                          {mine && (
                            <span style={{ marginRight: "0.35rem" }}>
                              {msg.isRead ? " ✓✓" : " ✓"}
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

            {/* حقل الإرسال */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid rgba(200,149,108,0.15)",
                background: "rgba(255,255,255,0.6)",
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
                  placeholder="اكتب رسالتك هنا..."
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: "0.85rem 1.25rem",
                    borderRadius: "14px",
                    border: "1.5px solid rgba(200,149,108,0.25)",
                    outline: "none",
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "0.95rem",
                    background: "rgba(255,255,255,0.9)",
                    transition: "border-color 0.2s",
                    color: "var(--dark)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--terracotta)")}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(200,149,108,0.25)")
                  }
                />
                <button
                  type="submit"
                  disabled={!content.trim() || sending}
                  style={{
                    padding: "0.85rem 1.75rem",
                    borderRadius: "14px",
                    background:
                      !content.trim() || sending
                        ? "rgba(181,83,26,0.3)"
                        : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: !content.trim() || sending ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    flexShrink: 0,
                    boxShadow:
                      !content.trim() || sending ? "none" : "0 4px 14px rgba(181,83,26,0.3)",
                  }}
                >
                  {sending ? "..." : "إرسال ←"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              gap: "1rem",
            }}
          >
            <div style={{ fontSize: "4rem" }}>💬</div>
            <p style={{ fontWeight: 700, fontSize: "1rem" }}>اختر محادثة للبدء</p>
            <p style={{ fontSize: "0.85rem", textAlign: "center", maxWidth: "240px" }}>
              اختر محادثة من القائمة على اليسار أو أنشئ محادثة جديدة من صفحة الخريطة
            </p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .messages-layout {
            flex-direction: column !important;
            height: calc(100vh - 130px) !important;
            border-radius: 16px !important;
          }
          .conversations-sidebar {
            width: 100% !important;
            max-height: 220px !important;
            border-left: none !important;
            border-bottom: 1px solid rgba(200,149,108,0.2) !important;
          }
        }
        @media (max-width: 480px) {
          .messages-layout {
            height: calc(100vh - 110px) !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
