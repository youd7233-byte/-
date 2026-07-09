"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MessageButton({ artisanId }: { artisanId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startConversation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/messages");
      } else {
        alert(data.error || "فشل بدء المحادثة");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startConversation}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "0.9rem 1.75rem",
        background: "var(--dark)", color: "#fff", borderRadius: "14px",
        fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: "1rem", border: "none",
        cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
      }}
    >
      💬 {loading ? "جاري البدء..." : "رسالة"}
    </button>
  );
}
