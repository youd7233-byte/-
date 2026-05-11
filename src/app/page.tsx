"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

const CRAFTS = [
  { icon: "🛠️", label: "نجارة" },
  { icon: "⚡", label: "كهرباء" },
  { icon: "🚿", label: "سباكة" },
  { icon: "🎨", label: "دهان" },
  { icon: "🏗️", label: "بناء" },
  { icon: "❄️", label: "تكييف" },
];

const STATS = [
  { icon: "🤝", value: "+10,000", label: "عميل يثق بنا" },
  { icon: "👷", value: "+2,500", label: "حرفي معتمد", featured: true },
  { icon: "⭐", value: "4.9/5", label: "رضا العملاء" },
];

const FEATURES = [
  {
    icon: "📍",
    title: "ظهور محلي فوري",
    desc: "يجدك العملاء على الخريطة بمجرد تسجيلك، حسب موقعك الجغرافي بالضبط.",
  },
  {
    icon: "⭐",
    title: "نظام تقييمات موثوق",
    desc: "التقييمات الحقيقية تبني سمعتك وتزيد طلباتك كل أسبوع.",
  },
  {
    icon: "💳",
    title: "دفع إلكتروني جزائري",
    desc: "استقبل مدفوعات ببريدي موب و CIB مباشرة بدون تعقيد.",
  },
  {
    icon: "🔔",
    title: "إشعارات فورية",
    desc: "تصلك طلبات العملاء على هاتفك لحظة بلحظة.",
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--text)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <header
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "6rem 1.5rem 7rem",
          textAlign: "center",
        }}
      >
        {/* Background blobs */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(212,168,67,0.13) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 55% at 85% 80%, rgba(181,83,26,0.09) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", maxWidth: "860px", margin: "0 auto" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.4rem 1.1rem",
            background: "rgba(181,83,26,0.08)",
            border: "1px solid rgba(181,83,26,0.18)",
            borderRadius: "999px",
            color: "var(--terracotta)",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "2rem",
            animation: "fadeUp 0.5s ease both",
          }}>
            ✨ المنصة الأولى للحرفيين في الجزائر
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
              fontWeight: 900,
              color: "var(--dark)",
              lineHeight: 1.18,
              marginBottom: "1.5rem",
              animation: "fadeUp 0.6s 0.1s ease both",
            }}
          >
            حوّل مهارتك إلى{" "}
            <span style={{ color: "var(--terracotta)" }}>دخل ثابت</span>
            <br />
            مع منصة{" "}
            <span
              style={{
                color: "var(--gold)",
                position: "relative",
                display: "inline-block",
              }}
            >
              حِرَفي
              <svg
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  right: 0,
                  left: 0,
                  width: "100%",
                  overflow: "visible",
                }}
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q50 0 100 6"
                  stroke="var(--gold)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--muted)",
              maxWidth: "540px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.75,
              animation: "fadeUp 0.6s 0.2s ease both",
            }}
          >
            نربط أمهر الحرفيين بالعملاء الذين يبحثون عن الجودة. انضم اليوم وابدأ باستقبال طلبات حقيقية من منطقتك.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
              animation: "fadeUp 0.6s 0.3s ease both",
            }}
          >
            <button
              id="search-artisan-btn"
              style={{
                padding: "0.9rem 2.4rem",
                borderRadius: "14px",
                background: "var(--dark)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 28px rgba(26,18,8,0.18)",
                transition: "all 0.22s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 36px rgba(26,18,8,0.22)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(26,18,8,0.18)";
              }}
            >
              🔍 ابحث عن حرفي
            </button>

            <Link
              href="/register-artisan"
              id="register-artisan-link"
              style={{
                padding: "0.9rem 2.4rem",
                borderRadius: "14px",
                background: "var(--terracotta)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                boxShadow: "0 8px 28px rgba(181,83,26,0.28)",
                transition: "all 0.22s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.background = "var(--mid)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.background = "var(--terracotta)";
              }}
            >
              سجّل حرفتك مجاناً ←
            </Link>
          </div>
        </div>
      </header>

      {/* ── Crafts Trust Bar ── */}
      <section
        style={{
          borderTop: "1px solid rgba(200,149,108,0.15)",
          borderBottom: "1px solid rgba(200,149,108,0.15)",
          background: "rgba(245,237,216,0.5)",
          padding: "1.25rem 1.5rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "1rem 2.5rem",
          }}
        >
          {CRAFTS.map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--mid)",
                opacity: 0.7,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "5rem 1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {STATS.map(({ icon, value, label, featured }) => (
            <div
              key={label}
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "24px",
                textAlign: "center",
                background: featured ? "var(--dark)" : "#fff",
                border: featured ? "none" : "1px solid rgba(200,149,108,0.15)",
                boxShadow: featured
                  ? "0 20px 60px rgba(26,18,8,0.2)"
                  : "0 4px 20px rgba(26,18,8,0.06)",
                transition: "transform 0.22s, box-shadow 0.22s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = featured
                  ? "0 28px 70px rgba(26,18,8,0.25)"
                  : "0 12px 36px rgba(26,18,8,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = featured
                  ? "0 20px 60px rgba(26,18,8,0.2)"
                  : "0 4px 20px rgba(26,18,8,0.06)";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: featured ? "rgba(255,255,255,0.07)" : "var(--sand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  margin: "0 auto 1.25rem",
                }}
              >
                {icon}
              </div>
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  color: featured ? "var(--gold)" : "var(--dark)",
                  marginBottom: "0.35rem",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: featured ? "rgba(255,255,255,0.55)" : "var(--muted)",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        style={{
          padding: "5rem 1.5rem",
          background: "linear-gradient(180deg, var(--sand) 0%, var(--cream) 100%)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 900,
                color: "var(--dark)",
                marginBottom: "0.75rem",
              }}
            >
              كل ما تحتاجه لنجاح حرفتك
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>
              منصة متكاملة صُممت خصيصاً للحرفي الجزائري
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                style={{
                  padding: "2rem 1.75rem",
                  borderRadius: "20px",
                  background: "#fff",
                  border: "1px solid rgba(200,149,108,0.14)",
                  boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
                  transition: "all 0.25s",
                  animationDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(181,83,26,0.1)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(181,83,26,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(26,18,8,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,149,108,0.14)";
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(181,83,26,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    marginBottom: "1.1rem",
                  }}
                >
                  {icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "var(--dark)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.65 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            background: "linear-gradient(135deg, var(--mid) 0%, var(--dark) 100%)",
            borderRadius: "32px",
            padding: "4rem 3rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(26,18,8,0.28)",
          }}
        >
          {/* Decorative rings */}
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "200px", height: "200px",
            border: "50px solid rgba(255,255,255,0.04)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "-40px",
            width: "160px", height: "160px",
            background: "rgba(212,168,67,0.08)",
            borderRadius: "50%",
            filter: "blur(30px)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)",
                fontWeight: 900,
                color: "#fff",
                marginBottom: "1rem",
              }}
            >
              جاهز تبدأ تكسب أكثر؟
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "1rem",
                marginBottom: "2.25rem",
                maxWidth: "440px",
                margin: "0 auto 2.25rem",
              }}
            >
              انضم الآن لأكبر تجمع حرفيين في الجزائر واحصل على وصول فوري لآلاف العملاء.
            </p>
            <Link
              href="/register-artisan"
              id="cta-register-btn"
              style={{
                display: "inline-block",
                padding: "1rem 3rem",
                borderRadius: "14px",
                background: "var(--gold)",
                color: "var(--dark)",
                fontWeight: 900,
                fontSize: "1.05rem",
                boxShadow: "0 8px 32px rgba(212,168,67,0.3)",
                transition: "all 0.22s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fff";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--gold)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              سجّل مجاناً الآن ←
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(200,149,108,0.15)",
          padding: "2.5rem 1.5rem",
          background: "var(--cream)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <div
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "var(--terracotta)",
            }}
          >
            حِرَفي<span style={{ color: "var(--gold)" }}>.</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {["من نحن", "الشروط والأحكام", "سياسة الخصوصية", "اتصل بنا"].map((t) => (
              <a
                key={t}
                href="#"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--muted)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--terracotta)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}
              >
                {t}
              </a>
            ))}
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            © 2025 حِرَفي — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
