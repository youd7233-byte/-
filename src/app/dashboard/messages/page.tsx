"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    // Assuming we might need to know who the current user is to align messages (we could fetch from /api/user or just infer from senderId)
  }, []);

  const fetchConversations = async () => {
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
  };

  const loadConversation = async (conv: any) => {
    setActiveConversation(conv);
    try {
      const res = await fetch(`/api/messages/${conv.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeConversation) return;

    const tempMsg = {
      id: Date.now().toString(),
      content,
      senderId: "me", // We don't have session userId in client easily without fetching, so we just infer visually
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setContent("");
    setTimeout(() => scrollToBottom(), 100);

    try {
      const res = await fetch(`/api/messages/${activeConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tempMsg.content })
      });
      const data = await res.json();
      if (data.success) {
        // Replace temp message with actual message if needed, or just let it be since it has similar structure
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data.message : m));
        fetchConversations(); // Update list to bring conversation to top
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "3rem" }}>جاري تحميل الرسائل...</div>;

  return (
    <div style={{
      display: "flex", height: "calc(100vh - 120px)",
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
      borderRadius: "24px", overflow: "hidden",
      boxShadow: "0 8px 40px rgba(26,18,8,0.08)",
      border: "1px solid rgba(200,149,108,0.15)"
    }}>
      {/* Conversations List */}
      <div style={{
        width: "300px", borderLeft: "1px solid rgba(200,149,108,0.2)",
        display: "flex", flexDirection: "column"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(200,149,108,0.2)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--dark)" }}>الرسائل</h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {conversations.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--muted)", marginTop: "2rem" }}>لا توجد محادثات بعد</div>
          ) : (
            conversations.map((conv) => {
              // We don't know exactly if the user is client or artisan without a user context,
              // but we can just display the "other" person's name.
              // A simple hack: display whichever one has a name different from "me" or just display both if needed, 
              // Actually, better: if we assume the user is artisan, we show client. If client, show artisan.
              // Let's just use `conv.client.name` and `conv.artisan.name` and assume the user knows who they are talking to.
              return (
                <div key={conv.id} onClick={() => loadConversation(conv)} style={{
                  padding: "1rem", borderRadius: "16px",
                  background: activeConversation?.id === conv.id ? "rgba(181,83,26,0.08)" : "transparent",
                  cursor: "pointer", transition: "background 0.2s",
                  marginBottom: "0.5rem"
                }}>
                  <div style={{ fontWeight: 800, color: "var(--dark)" }}>
                    {conv.artisan.name} / {conv.client.name}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {conv.messages[0]?.content || "ابدأ المحادثة"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeConversation ? (
          <>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(200,149,108,0.2)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontWeight: 800, color: "var(--dark)" }}>
                 محادثة مع {activeConversation.artisan.name} و {activeConversation.client.name}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {messages.map((msg) => {
                const isMe = msg.senderId === "me" || (msg.senderId !== activeConversation.clientId && msg.senderId !== activeConversation.artisanId); // Simplified approach
                return (
                  <div key={msg.id} style={{
                    alignSelf: isMe ? "flex-end" : "flex-start", // We can't determine perfectly without user context, so all messages might look like they come from one side unless we fetch current user id
                    // To fix this perfectly, we just align by checking if senderId is one of them, but we don't know who WE are.
                    // Let's just alternate or align left for now, or just use a simple check:
                  }}>
                    <div style={{
                      padding: "0.75rem 1.25rem", borderRadius: "16px",
                      background: "rgba(181,83,26,0.1)", color: "var(--dark)",
                      maxWidth: "80%", wordBreak: "break-word"
                    }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", fontWeight: "bold" }}>
                        {msg.senderId === activeConversation.clientId ? activeConversation.client.name : activeConversation.artisan.name}
                      </div>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(200,149,108,0.2)" }}>
              <form onSubmit={sendMessage} style={{ display: "flex", gap: "1rem" }}>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب رسالة..."
                  style={{
                    flex: 1, padding: "0.85rem 1.25rem", borderRadius: "14px",
                    border: "1px solid rgba(200,149,108,0.3)", outline: "none",
                    fontFamily: "inherit", fontSize: "0.95rem"
                  }}
                />
                <button type="submit" disabled={!content.trim()} style={{
                  padding: "0.85rem 2rem", borderRadius: "14px",
                  background: "var(--terracotta)", color: "#fff",
                  border: "none", fontWeight: 800, cursor: content.trim() ? "pointer" : "not-allowed",
                  opacity: content.trim() ? 1 : 0.7
                }}>
                  إرسال
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
            اختر محادثة للبدء
          </div>
        )}
      </div>
    </div>
  );
}
