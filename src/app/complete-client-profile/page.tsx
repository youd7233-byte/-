"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const WILAYAS = [
  "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة",
  "تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة",
  "سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة",
  "وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة",
  "سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون",
  "برج باجي مختار","أولاد جلال","بني عباس","إن صالح","إن قزام","توقرت","جانت","المغير","المنيعة",
];

export default function CompleteClientProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", wilaya: "" });

  // جلب اسم المستخدم من الجلسة إذا كان متوفراً
  useEffect(() => {
    fetch("/api/user/me")
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setForm(prev => ({ ...prev, name: data.name }));
        }
      })
      .catch(() => {}); // التجاهل في حالة الخطأ
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.wilaya) {
      setError("الرجاء ملء جميع الحقول");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/client/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "فشل الحفظ");
      }

      router.push("/map");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 50% at 10% 20%, rgba(181,83,26,0.07) 0%, transparent 60%)",
      }} />
      <main style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "calc(100vh - 70px)", padding: "2rem 1.5rem", position: "relative", zIndex: 1,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
          borderRadius: "28px", padding: "3rem 2.5rem",
          boxShadow: "0 20px 70px rgba(26,18,8,0.1)", border: "1px solid rgba(200,149,108,0.18)",
          width: "100%", maxWidth: "500px", animation: "fadeUp 0.5s ease both",
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.5rem" }}>
              مرحباً بك في حِرَفي
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
              يرجى تأكيد بياناتك لنوجهك للحرفيين في ولايتك
            </p>
          </div>

          {error && (
            <div style={{
              background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "12px", padding: "0.9rem 1.2rem", color: "#c53030",
              fontSize: "0.9rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center",
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 800, color: "var(--dark)", marginBottom: "0.5rem" }}>
                الاسم واللقب <span style={{ color: "var(--terracotta)" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: يوسف أحمد"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  width: "100%", padding: "0.95rem 1.2rem",
                  border: "2px solid rgba(200,149,108,0.22)", borderRadius: "14px",
                  fontSize: "1rem", fontFamily: "'Cairo', sans-serif", color: "var(--text)",
                  background: "rgba(255,255,255,0.7)", outline: "none", transition: "all 0.2s",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 800, color: "var(--dark)", marginBottom: "0.5rem" }}>
                الولاية <span style={{ color: "var(--terracotta)" }}>*</span>
              </label>
              <select
                value={form.wilaya}
                onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                style={{
                  width: "100%", padding: "0.95rem 1.2rem",
                  border: "2px solid rgba(200,149,108,0.22)", borderRadius: "14px",
                  fontSize: "1rem", fontFamily: "'Cairo', sans-serif", color: "var(--text)",
                  background: "rgba(255,255,255,0.7)", outline: "none", transition: "all 0.2s",
                }}
              >
                <option value="">اختر ولايتك...</option>
                {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "1.05rem", borderRadius: "16px",
                background: "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)",
                color: "#fff", fontFamily: "'Cairo', sans-serif",
                fontWeight: 900, fontSize: "1.05rem", border: "none",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                boxShadow: "0 8px 28px rgba(181,83,26,0.28)", marginTop: "1rem", transition: "all 0.2s",
              }}
            >
              {loading ? "جاري الحفظ..." : "البحث عن الحرفيين 🚀"}
            </button>
          </form>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        select:focus, input:focus {
          border-color: var(--terracotta) !important;
          box-shadow: 0 0 0 4px rgba(181,83,26,0.1) !important;
        }
      `}</style>
    </div>
  );
}
