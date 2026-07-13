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
      // Reload page to show new review
      window.location.reload();
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: "rgba(181,83,26,0.04)", borderRadius: "16px", padding: "1.5rem",
      border: "1px solid rgba(200,149,108,0.15)", marginTop: "1.5rem",
    }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--dark)", marginBottom: "1rem" }}>
        أضف تقييمك للحرفي
      </h3>
      
      {/* Stars */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem", direction: "ltr", justifyContent: "flex-end" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star} type="button"
            style={{
              background: "none", border: "none", cursor: "pointer", fontSize: "2rem",
              color: star <= (hoverRating || rating) ? "#f59e0b" : "#e5e7eb",
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
          border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px",
          fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
          background: "rgba(255,255,255,0.7)", outline: "none",
          marginBottom: "1rem", resize: "vertical",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: message.startsWith("✅") ? "#16a34a" : "#dc2626" }}>
          {message}
        </span>
        <button
          type="submit" disabled={loading}
          style={{
            padding: "0.75rem 1.5rem", borderRadius: "12px",
            background: loading ? "#ccc" : "var(--terracotta)",
            color: "#fff", border: "none", fontWeight: 800, fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "جاري الإرسال..." : "إرسال التقييم"}
        </button>
      </div>
    </form>
  );
}
