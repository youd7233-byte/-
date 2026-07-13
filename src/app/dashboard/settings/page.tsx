"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "350px", background: "#e5e7eb", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      جاري تحميل الخريطة...
    </div>
  ),
});

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "location">("profile");
  const [form, setForm] = useState({
    name: "", phone: "", profession: "", bio: "",
    lat: null as number | null, lng: null as number | null,
  });
  const [portfolios, setPortfolios] = useState<{ id: string; imageUrl: string; description?: string }[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [newPortfolioDesc, setNewPortfolioDesc] = useState("");
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
    fetchPortfolios();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/me");
      if (res.ok) {
        const data = await res.json();
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          profession: data.artisanProfile?.profession || "",
          bio: data.artisanProfile?.bio || "",
          lat: data.artisanProfile?.lat || null,
          lng: data.artisanProfile?.lng || null,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolios = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setPortfolios(data.portfolios || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, lat, lng }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMsg({ text: "المتصفح لا يدعم تحديد الموقع", type: "error" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setMsg({ text: "تم تحديد الموقع بنجاح", type: "success" });
      },
      () => setMsg({ text: "تعذر الحصول على الموقع", type: "error" })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      const updateRes = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!updateRes.ok) throw new Error("فشل الحفظ");
      setMsg({ text: "✅ تم حفظ الإعدادات بنجاح!", type: "success" });
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolioUrl.trim()) {
      setMsg({ text: "الرجاء إدخال رابط الصورة", type: "error" });
      return;
    }
    setUploadingPortfolio(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: newPortfolioUrl, description: newPortfolioDesc }),
      });
      if (!res.ok) throw new Error("فشل الإضافة");
      const data = await res.json();
      setPortfolios((prev) => [data.portfolio, ...prev]);
      setNewPortfolioUrl("");
      setNewPortfolioDesc("");
      setMsg({ text: "✅ تم إضافة الصورة بنجاح!", type: "success" });
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
      setMsg({ text: "✅ تم حذف الصورة", type: "success" });
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.85rem 1.2rem",
    border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px",
    fontSize: "1rem", fontFamily: "'Cairo', sans-serif",
    outline: "none", background: "rgba(255,255,255,0.7)",
    transition: "border-color 0.2s",
  };

  const tabs = [
    { id: "profile" as const, label: "المعلومات", icon: "👤" },
    { id: "portfolio" as const, label: "صور الأعمال", icon: "🖼️" },
    { id: "location" as const, label: "الموقع", icon: "📍" },
  ];

  return (
    <div className="settings-container" style={{
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
      borderRadius: "24px", padding: "2rem",
      boxShadow: "0 8px 40px rgba(26,18,8,0.08)",
      border: "1px solid rgba(200,149,108,0.15)",
      maxWidth: "860px", margin: "0 auto",
    }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1.5rem" }}>
        ⚙️ إعدادات الملف الشخصي
      </h1>

      {/* Message */}
      {msg.text && (
        <div style={{
          padding: "0.85rem 1rem", borderRadius: "12px", marginBottom: "1.5rem",
          background: msg.type === "error" ? "rgba(220,38,38,0.1)" : "rgba(34,197,94,0.1)",
          color: msg.type === "error" ? "#b91c1c" : "#15803d", fontWeight: 700,
          border: `1px solid ${msg.type === "error" ? "rgba(220,38,38,0.2)" : "rgba(34,197,94,0.2)"}`,
        }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs" style={{
        display: "flex", gap: "0.5rem", marginBottom: "2rem",
        background: "rgba(181,83,26,0.06)", borderRadius: "14px", padding: "0.4rem",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "0.75rem 1rem",
              borderRadius: "10px", border: "none",
              fontFamily: "'Cairo', sans-serif", fontWeight: 800,
              fontSize: "0.9rem", cursor: "pointer",
              background: activeTab === tab.id
                ? "linear-gradient(135deg, var(--terracotta), #d45e1a)"
                : "transparent",
              color: activeTab === tab.id ? "#fff" : "var(--muted)",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="settings-grid">
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, color: "var(--dark)" }}>الاسم الكامل</label>
              <input
                type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle} placeholder="اسمك الكامل"
                onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.2)")}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, color: "var(--dark)" }}>رقم الهاتف</label>
              <input
                type="tel" dir="ltr" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ ...inputStyle, textAlign: "right" }} placeholder="0555 55 55 55"
                onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.2)")}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, color: "var(--dark)" }}>المهنة / الحرفة</label>
            <input
              type="text" value={form.profession}
              onChange={(e) => setForm({ ...form, profession: e.target.value })}
              style={inputStyle} placeholder="مثل: كهربائي، سباك، نجار..."
              onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.2)")}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, color: "var(--dark)" }}>نبذة مختصرة</label>
            <textarea
              rows={4} value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="اكتب نبذة عنك وعن خدماتك..."
              onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.2)")}
            />
          </div>

          <button
            type="submit" disabled={saving}
            style={{
              padding: "1rem 2rem", borderRadius: "14px",
              background: saving ? "#ccc" : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
              color: "#fff", border: "none", fontWeight: 900,
              fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 4px 16px rgba(181,83,26,0.3)",
            }}
          >
            {saving ? "جاري الحفظ..." : "💾 حفظ التغييرات"}
          </button>
        </form>
      )}

      {/* Portfolio Tab */}
      {activeTab === "portfolio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Add Portfolio */}
          <div style={{
            background: "rgba(181,83,26,0.04)", borderRadius: "16px", padding: "1.5rem",
            border: "1.5px dashed rgba(181,83,26,0.3)",
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1rem" }}>
              ➕ إضافة صورة عمل جديدة
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700, fontSize: "0.88rem", color: "var(--dark)" }}>
                  رابط الصورة (URL)
                </label>
                <input
                  type="url" value={newPortfolioUrl}
                  onChange={(e) => setNewPortfolioUrl(e.target.value)}
                  placeholder="https://example.com/my-work.jpg"
                  dir="ltr"
                  style={{ ...inputStyle, fontSize: "0.9rem" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.2)")}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700, fontSize: "0.88rem", color: "var(--dark)" }}>
                  وصف الصورة (اختياري)
                </label>
                <input
                  type="text" value={newPortfolioDesc}
                  onChange={(e) => setNewPortfolioDesc(e.target.value)}
                  placeholder="مثل: تركيب ثريا كريستال في صالون"
                  style={{ ...inputStyle, fontSize: "0.9rem" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.2)")}
                />
              </div>
              {newPortfolioUrl && (
                <div style={{
                  width: "100%", height: "180px", borderRadius: "12px",
                  overflow: "hidden", border: "2px solid rgba(200,149,108,0.2)",
                }}>
                  <img
                    src={newPortfolioUrl}
                    alt="معاينة"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <button
                onClick={handleAddPortfolio}
                disabled={uploadingPortfolio || !newPortfolioUrl}
                style={{
                  padding: "0.85rem", borderRadius: "12px",
                  background: uploadingPortfolio || !newPortfolioUrl ? "#ccc" : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                  color: "#fff", border: "none", fontWeight: 800,
                  fontSize: "0.95rem", cursor: uploadingPortfolio || !newPortfolioUrl ? "not-allowed" : "pointer",
                }}
              >
                {uploadingPortfolio ? "جاري الإضافة..." : "➕ إضافة الصورة"}
              </button>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1rem" }}>
              🖼️ معرض أعمالك ({portfolios.length} صورة)
            </h3>
            {portfolios.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--muted)", background: "rgba(181,83,26,0.03)", borderRadius: "16px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📷</div>
                <p style={{ fontWeight: 700 }}>لم تضف أي صور بعد</p>
                <p style={{ fontSize: "0.85rem" }}>أضف صور أعمالك لتجذب المزيد من العملاء</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "1rem",
              }}>
                {portfolios.map((p) => (
                  <div key={p.id} style={{ position: "relative", borderRadius: "14px", overflow: "hidden", aspectRatio: "1" }}>
                    <img
                      src={p.imageUrl} alt={p.description || "صورة عمل"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {p.description && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "rgba(0,0,0,0.7)", color: "#fff",
                        padding: "0.5rem", fontSize: "0.72rem", fontWeight: 700,
                      }}>{p.description}</div>
                    )}
                    <button
                      onClick={() => handleDeletePortfolio(p.id)}
                      style={{
                        position: "absolute", top: "6px", left: "6px",
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "rgba(220,38,38,0.9)", color: "#fff",
                        border: "none", cursor: "pointer", fontSize: "0.75rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Tab */}
      {activeTab === "location" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontWeight: 900, color: "var(--dark)", marginBottom: "0.25rem" }}>تحديد موقعك الجغرافي</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {form.lat && form.lng
                  ? `✅ موقع محدد: ${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}`
                  : "انقر على الخريطة لتحديد موقعك"}
              </p>
            </div>
            <button
              type="button" onClick={getLocation}
              style={{
                padding: "0.65rem 1.25rem", borderRadius: "10px",
                background: "var(--terracotta)", color: "#fff",
                border: "none", cursor: "pointer", fontSize: "0.88rem", fontWeight: 700,
              }}
            >
              📡 تحديد تلقائي
            </button>
          </div>
          <div style={{ height: "380px", borderRadius: "16px", overflow: "hidden", border: "2px solid rgba(200,149,108,0.2)" }}>
            <Map
              interactive={true}
              onLocationSelect={handleMapSelect}
              defaultCenter={form.lat && form.lng ? [form.lat, form.lng] : [36.75, 3.05]}
              selectedLocation={form.lat && form.lng ? { lat: form.lat, lng: form.lng } : null}
            />
          </div>
          <button
            onClick={handleSubmit as any}
            disabled={saving || (!form.lat && !form.lng)}
            style={{
              padding: "0.9rem", borderRadius: "12px",
              background: saving ? "#ccc" : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
              color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "جاري الحفظ..." : "💾 حفظ الموقع"}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .settings-grid { grid-template-columns: 1fr !important; }
          .settings-container { padding: 1.25rem !important; }
          .settings-tabs { flex-wrap: wrap !important; }
        }
      `}</style>
    </div>
  );
}
