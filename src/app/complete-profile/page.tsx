"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div style={{ height: "400px", background: "#e5e7eb", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري تحميل الخريطة...</div>
});

const WILAYAS = [
  "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة",
  "تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة",
  "سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة",
  "وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة",
  "سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون",
  "برج باجي مختار","أولاد جلال","بني عباس","إن صالح","إن قزام","توقرت","جانت","المغير","المنيعة",
];

const PROFESSIONS = [
  "نجار","كهربائي","سبّاك","دهّان","بنّاء","ميكانيكي","حداد","مبلّط",
  "مكيفات","لحام","فني صحة","طيّار دهان","نقاش","رصّاف","عامل تنظيف","مصلح إلكترونيات",
  "أخرى",
];

interface FormData {
  profession: string;
  wilaya: string;
  city: string;
  bio: string;
  phone: string;
  lat: number | null;
  lng: number | null;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    profession: "", wilaya: "", city: "", bio: "", phone: "", lat: null, lng: null,
  });

  const update = (field: keyof FormData, value: string | number | null) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("المتصفح الخاص بك لا يدعم تحديد الموقع");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("lat", pos.coords.latitude);
        update("lng", pos.coords.longitude);
      },
      (err) => {
        setError("تعذر الحصول على الموقع. يرجى تحديده يدوياً من الخريطة.");
      }
    );
  };

  const handleMapSelect = (lat: number, lng: number) => {
    update("lat", lat);
    update("lng", lng);
  };

  const handleSubmit = async () => {
    if (!form.profession || !form.wilaya || !form.phone) {
      setError("الرجاء ملء جميع الحقول الإلزامية");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/artisan/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "فشل الحفظ");
      }
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(20px)",
    borderRadius: "28px",
    padding: "3rem",
    boxShadow: "0 20px 70px rgba(26,18,8,0.1)",
    border: "1px solid rgba(200,149,108,0.18)",
    width: "100%",
    maxWidth: "600px",
    animation: "fadeUp 0.5s ease both",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.95rem 1.2rem",
    border: "2px solid rgba(200,149,108,0.22)",
    borderRadius: "14px", fontSize: "1rem",
    fontFamily: "'Cairo', sans-serif",
    color: "var(--text)",
    background: "rgba(255,255,255,0.7)",
    outline: "none", transition: "all 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.88rem",
    fontWeight: 800, color: "var(--dark)", marginBottom: "0.5rem",
  };

  const nextBtnStyle: React.CSSProperties = {
    width: "100%", padding: "1.05rem",
    borderRadius: "16px",
    background: "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)",
    color: "#fff", fontFamily: "'Cairo', sans-serif",
    fontWeight: 900, fontSize: "1.05rem",
    border: "none", cursor: "pointer",
    boxShadow: "0 8px 28px rgba(181,83,26,0.28)",
    marginTop: "1.5rem", transition: "all 0.2s",
  };

  const steps = ["الحرفة والموقع", "التواصل ونبذة", "تحديد موقعك"];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 50% at 10% 20%, rgba(181,83,26,0.07) 0%, transparent 60%)",
      }} />
      <main style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "3rem 1.5rem", position: "relative", zIndex: 1,
      }}>

        {/* Progress */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem", alignItems: "center" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: i + 1 <= step ? "var(--terracotta)" : "rgba(200,149,108,0.2)",
                color: i + 1 <= step ? "#fff" : "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: "0.9rem", transition: "all 0.3s",
              }}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: "0.8rem", fontWeight: 600,
                color: i + 1 === step ? "var(--terracotta)" : "var(--muted)",
              }}>{s}</span>
              {i < steps.length - 1 && (
                <div style={{ width: "30px", height: "2px", background: i + 1 < step ? "var(--terracotta)" : "rgba(200,149,108,0.2)", borderRadius: "1px" }} />
              )}
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          {error && (
            <div style={{
              background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "12px", padding: "0.9rem 1.2rem", color: "#c53030",
              fontSize: "0.9rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center",
            }}>⚠️ {error}</div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.5rem" }}>
                🔨 حرفتك وموقعك
              </h2>
              <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
                أخبرنا بما تتقنه وأين تعمل
              </p>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>نوع الحِرفة <span style={{ color: "var(--terracotta)" }}>*</span></label>
                <select value={form.profession} onChange={(e) => update("profession", e.target.value)} style={inputStyle}>
                  <option value="">اختر حرفتك...</option>
                  {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={labelStyle}>الولاية <span style={{ color: "var(--terracotta)" }}>*</span></label>
                  <select value={form.wilaya} onChange={(e) => update("wilaya", e.target.value)} style={inputStyle}>
                    <option value="">اختر الولاية...</option>
                    {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>البلدية / الحي</label>
                  <input
                    type="text" placeholder="مثال: حي النصر"
                    value={form.city} onChange={(e) => update("city", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button style={nextBtnStyle} onClick={() => {
                if (!form.profession || !form.wilaya) { setError("اختر الحرفة والولاية"); return; }
                setError(""); setStep(2);
              }}>
                التالي ←
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.5rem" }}>
                📝 التواصل ونبذة عنك
              </h2>
              <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
                رقم الهاتف الخاص بك ونبذة تظهر للعملاء
              </p>
              
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>رقم الهاتف <span style={{ color: "var(--terracotta)" }}>*</span></label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="0555 55 55 55"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  style={{ ...inputStyle, textAlign: "right" }}
                />
              </div>

              <div>
                <label style={labelStyle}>نبذة مختصرة عن عملك</label>
                <textarea
                  rows={4}
                  placeholder="مثال: خبرة 10 سنوات في النجارة، أصنع أثاثاً حسب الطلب بجودة عالية..."
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: "1rem",
                  borderRadius: "14px", border: "2px solid rgba(200,149,108,0.3)",
                  background: "transparent", color: "var(--muted)", fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                }}>→ السابق</button>
                <button style={{ ...nextBtnStyle, flex: 2, marginTop: 0 }} onClick={() => { 
                  if (!form.phone) { setError("يرجى إدخال رقم الهاتف"); return; }
                  setError(""); setStep(3); 
                }}>
                  التالي ←
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div style={{ width: "100%" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.5rem" }}>
                📍 موقعك على الخريطة
              </h2>
              <p style={{ color: "var(--muted)", marginBottom: "1rem", fontSize: "0.95rem" }}>
                انقر على الخريطة لتحديد موقعك أو استخدم التحديد التلقائي
              </p>
              
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                <button onClick={getLocation} style={{
                  padding: "0.6rem 1rem", borderRadius: "8px",
                  background: "var(--terracotta)", color: "#fff",
                  fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "0.85rem",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem"
                }}>
                  📡 تحديد تلقائي
                </button>
              </div>

              <div style={{ height: "350px", width: "100%", marginBottom: "1.5rem" }}>
                <Map 
                  interactive={true} 
                  onLocationSelect={handleMapSelect} 
                  defaultCenter={form.lat && form.lng ? [form.lat, form.lng] : [36.75, 3.05]}
                  selectedLocation={form.lat && form.lng ? { lat: form.lat, lng: form.lng } : null}
                />
              </div>

              {form.lat && (
                <div style={{ textAlign: "center", marginBottom: "1rem", color: "var(--terracotta)", fontWeight: 700, fontSize: "0.9rem" }}>
                  تم تحديد الموقع: {form.lat.toFixed(4)}, {form.lng?.toFixed(4)}
                </div>
              )}

              <p style={{ fontSize: "0.85rem", color: "var(--muted)", textAlign: "center", marginBottom: "1.5rem" }}>
                * يمكنك تخطي الخريطة وإضافة الموقع لاحقاً
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={() => setStep(2)} style={{
                  flex: 1, padding: "1rem",
                  borderRadius: "14px", border: "2px solid rgba(200,149,108,0.3)",
                  background: "transparent", color: "var(--muted)", fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                }}>→ السابق</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ ...nextBtnStyle, flex: 2, marginTop: 0, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                >
                  {loading ? "جاري الحفظ..." : "🚀 إنشاء ملفي"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        select:focus, input:focus, textarea:focus {
          border-color: var(--terracotta) !important;
          box-shadow: 0 0 0 4px rgba(181,83,26,0.1) !important;
        }
      `}</style>
    </div>
  );
}
