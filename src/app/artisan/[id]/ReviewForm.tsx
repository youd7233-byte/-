"use client";

import { useState } from "react";

export default function ReviewForm({ artisanProfileId }: { artisanProfileId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage("الرجاء اختيار التقييم بالنجوم");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanProfileId, rating, comment }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "حدث خطأ أثناء التقييم");
      }

      setMessage("✅ تم إرسال تقييمك بنجاح!");
      setRating(0);
      setComment("");
      window.location.reload();
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: "#0D0F14", borderRadius: "18px", padding: "1.5rem",
      border: "1px solid rgba(217,162,100,0.18)", marginTop: "1.5rem",
    }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#F0F4F8", marginBottom: "1rem" }}>
        أضف تقييمك للحرفي
      </h3>
      
      {/* Stars */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem", direction: "ltr", justifyContent: "flex-end" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star} type="button"
            style={{
              background: "none", border: "none", cursor: "pointer", fontSize: "2rem",
              color: star <= (hoverRating || rating) ? "#facc15" : "#6A7A8A",
              transition: "color 0.2s",
            }}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="اكتب تعليقك حول الخدمة (اختياري)..."
        rows={3}
        style={{
          width: "100%", padding: "0.85rem",
          border: "1px solid rgba(217,162,100,0.2)", borderRadius: "14px",
          fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
          background: "#131820", outline: "none", color: "#F0F4F8",
          marginBottom: "1rem", resize: "vertical",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: message.startsWith("✅") ? "#4ade80" : "#f87171" }}>
          {message}
        </span>
        <button
          type="submit" disabled={loading}
          style={{
            padding: "0.75rem 1.5rem", borderRadius: "14px",
            background: loading ? "rgba(217,162,100,0.2)" : "linear-gradient(135deg, #D9A264, #A97B3C)",
            color: "#0D0F14", border: "none", fontWeight: 900, fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(217,162,100,0.2)",
          }}
        >
          {loading ? "جاري الإرسال..." : "إرسال التقييم"}
        </button>
      </div>
    </form>
  );
}
