"use client";

import { useState } from "react";
import styles from "./ArtisanRegisterForm.module.css";
import { registerArtisan } from "@/app/actions/artisan";
import Link from "next/link";

const WILAYAS = [
  "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار",
  "البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو",
  "الجزائر العاصمة","الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس",
  "عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران",
];

const PROFESSIONS = [
  "نجارة","كهرباء","سباكة","بناء وتشطيب","دهان","تبليط","لحام وحدادة",
  "خياطة","تصليح سيارات","تبريد وتكييف","أخرى",
];

const STEPS = [
  { label: "البيانات الشخصية" },
  { label: "معلومات الحرفة" },
  { label: "صور الأعمال" },
  { label: "الباقة" },
];

export default function ArtisanRegisterForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    formData.append("plan", plan);
    const result = await registerArtisan(formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "حدث خطأ غير متوقع");
    }
  }

  /* ── Success Screen ── */
  if (success) {
    return (
      <div className={styles.successScreen}>
        <div style={{ fontSize: "5rem", marginBottom: "1.5rem", animation: "fadeUp 0.5s ease" }}>🎉</div>
        <h2>تم تسجيلك بنجاح!</h2>
        <p style={{ marginBottom: "2rem" }}>
          مرحباً بك في منصة حِرَفي. سيتم مراجعة ملفك خلال 24 ساعة ثم ستبدأ بتلقي طلبات العملاء.
        </p>
        <Link href="/" className={styles.btnNext} style={{ textDecoration: "none", display: "inline-block", maxWidth: "220px" }}>
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Side Panel ── */}
      <aside className={styles.sidePanel}>
        <h2>
          سجّل حِرفتك<br />
          و<em>ابدأ بتلقي طلبات</em>
        </h2>
        <p>انضم لآلاف الحرفيين الجزائريين الذين يجدون عملاء جدد كل يوم عبر منصة حِرَفي.</p>

        {[
          { icon: "📍", title: "ظهور على خريطة Google", desc: "يراك العملاء مباشرة على الخريطة حسب موقعك الجغرافي" },
          { icon: "⭐", title: "نظام تقييمات موثوق", desc: "التقييمات الإيجابية تزيد من ظهورك وتجذب عملاء جدد" },
          { icon: "💳", title: "دفع إلكتروني جزائري", desc: "استقبل مدفوعات ببريدي موب و CIB مباشرة" },
          { icon: "🔔", title: "إشعارات فورية", desc: "تصلك طلبات العملاء على هاتفك لحظة بلحظة" },
        ].map(({ icon, title, desc }) => (
          <div key={title} className={styles.benefit}>
            <div className={styles.benefitIcon}>{icon}</div>
            <div className={styles.benefitText}>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          </div>
        ))}

        <div className={styles.pricingHint}>
          <h4>🎉 مجاني في البداية</h4>
          <p>تسجيل الملف الأساسي مجاني تماماً. باقات الإعلانات المميزة اختيارية تبدأ من 500 دج/شهر.</p>
        </div>
      </aside>

      {/* ── Form Area ── */}
      <div className={styles.formWrap}>
        {/* Steps Bar */}
        <div className={styles.stepsIndicator}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`${styles.stepDot} ${step > i ? styles.stepDotActive : ""}`}
              title={STEPS[i].label}
            />
          ))}
        </div>

        <form action={handleSubmit}>
          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div>
              <h2 className={styles.title}>معلوماتك الشخصية</h2>
              <p className={styles.subtitle}>الخطوة 1 من 4 — البيانات الأساسية للبدء</p>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>الاسم الكامل <span>*</span></label>
                  <input id="field-name" name="name" type="text" className={styles.input}
                    placeholder="مثال: عبد الرحمن بوزيد" required />
                </div>
                <div className={styles.field}>
                  <label>رقم الهاتف <span>*</span></label>
                  <input id="field-phone" name="phone" type="tel" className={styles.input}
                    placeholder="0555 000 000" dir="ltr" required />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>البريد الإلكتروني</label>
                  <input id="field-email" name="email" type="email" className={styles.input}
                    placeholder="example@email.com" dir="ltr" />
                </div>
                <div className={styles.field}>
                  <label>كلمة المرور <span>*</span></label>
                  <input id="field-password" name="password" type="password" className={styles.input}
                    placeholder="••••••••" required />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>الولاية <span>*</span></label>
                  <select id="field-wilaya" name="wilaya" className={styles.select} required>
                    <option value="">اختر الولاية...</option>
                    {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>البلدية / الحي</label>
                  <input id="field-city" name="city" type="text" className={styles.input}
                    placeholder="مثال: حي الصنوبر" />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem" }}>
                <button id="step1-next" type="button" onClick={nextStep} className={styles.btnNext}>
                  المتابعة للخطوة التالية ←
                </button>
              </div>
              <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", marginTop: "1.25rem" }}>
                لديك حساب بالفعل؟{" "}
                <Link href="/login" style={{ color: "var(--terracotta)", fontWeight: 700 }}>
                  سجّل دخولك من هنا
                </Link>
              </p>
            </div>
          )}

          {/* ── Step 2: Craft Info ── */}
          {step === 2 && (
            <div>
              <h2 className={styles.title}>معلومات الحِرفة</h2>
              <p className={styles.subtitle}>الخطوة 2 من 4 — تفاصيل عملك</p>

              <div className={styles.field}>
                <label>نوع الحِرفة <span>*</span></label>
                <select id="field-profession" name="profession" className={styles.select} required>
                  <option value="">اختر الحِرفة...</option>
                  {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label>التخصص الدقيق</label>
                <input id="field-specialty" name="specialty" type="text" className={styles.input}
                  placeholder="مثال: مطابخ وخزائن مصمتة، نجارة تقليدية..." />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>سنوات الخبرة</label>
                  <select id="field-experience" name="experience" className={styles.select}>
                    <option>أقل من سنة</option>
                    <option>1–3 سنوات</option>
                    <option>3–7 سنوات</option>
                    <option>7–15 سنة</option>
                    <option>أكثر من 15 سنة</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>نطاق التنقل</label>
                  <select id="field-range" name="range" className={styles.select}>
                    <option>5 كم</option>
                    <option>10 كم</option>
                    <option>20 كم</option>
                    <option>30 كم</option>
                    <option>الولاية كاملة</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label>وصف عملك</label>
                <textarea id="field-bio" name="bio" className={styles.textarea}
                  placeholder="اكتب هنا وصفاً لخدماتك، تخصصاتك، ونوع المشاريع التي تنجزها..." />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button id="step2-back" type="button" onClick={prevStep} className={styles.btnBack}>← رجوع</button>
                <button id="step2-next" type="button" onClick={nextStep} className={styles.btnNext}>التالي ←</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Photos ── */}
          {step === 3 && (
            <div>
              <h2 className={styles.title}>صور أعمالك</h2>
              <p className={styles.subtitle}>الخطوة 3 من 4 — أضف صور تجذب العملاء</p>

              <div className={styles.field}>
                <label>صورة الملف الشخصي</label>
                <div
                  className={styles.uploadZone}
                  onClick={() => document.getElementById("upload-avatar")?.click()}
                >
                  <input id="upload-avatar" name="avatar" type="file" accept="image/*" style={{ display: "none" }} />
                  <div className={styles.uploadIcon}>🤳</div>
                  <p>
                    <strong>اضغط للرفع</strong>
                    <br />
                    <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                      صورة واضحة لوجهك أو شعار ورشتك
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.field}>
                <label>صور الأعمال <span style={{ color: "var(--muted)", fontWeight: 400 }}>(حتى 10 صور)</span></label>
                <div
                  className={styles.uploadZone}
                  onClick={() => document.getElementById("upload-works")?.click()}
                >
                  <input id="upload-works" name="works" type="file" accept="image/*" multiple style={{ display: "none" }} />
                  <div className={styles.uploadIcon}>🖼️</div>
                  <p>
                    <strong>اضغط لرفع الصور</strong>
                    <br />
                    <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>JPG, PNG — الحجم الأقصى 5MB لكل صورة</span>
                    <br />
                    <span style={{ fontSize: "0.82rem", color: "var(--terracotta)", fontWeight: 700 }}>
                      صور الأعمال تزيد الطلبات بنسبة 3 أضعاف! 🚀
                    </span>
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button id="step3-back" type="button" onClick={prevStep} className={styles.btnBack}>← رجوع</button>
                <button id="step3-next" type="button" onClick={nextStep} className={styles.btnNext}>التالي ←</button>
              </div>
            </div>
          )}

          {/* ── Step 4: Plan ── */}
          {step === 4 && (
            <div>
              <h2 className={styles.title}>اختر باقتك</h2>
              <p className={styles.subtitle}>الخطوة 4 من 4 — ابدأ مجاناً أو احصل على ظهور أكثر</p>

              <div className={styles.plans}>
                {/* Free Plan */}
                <div
                  id="plan-free"
                  className={`${styles.planCard} ${plan === "free" ? styles.planCardSelected : ""}`}
                  onClick={() => setPlan("free")}
                >
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.2rem" }}>🆓 أساسي</div>
                  <div className={styles.planPrice}>
                    مجاني{" "}
                    <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--muted)" }}>للأبد</span>
                  </div>
                  <ul style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--muted)", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <li>✓ ملف شخصي كامل</li>
                    <li>✓ حتى 5 صور أعمال</li>
                    <li>✓ ظهور في نتائج البحث</li>
                    <li>✓ التواصل مع العملاء</li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div
                  id="plan-pro"
                  className={`${styles.planCard} ${plan === "pro" ? styles.planCardSelected : ""}`}
                  onClick={() => setPlan("pro")}
                >
                  <div style={{
                    position: "absolute", top: "-11px", right: "14px",
                    background: "var(--gold)", color: "var(--dark)",
                    padding: "2px 10px", borderRadius: "999px",
                    fontSize: "0.68rem", fontWeight: 800,
                  }}>
                    ⭐ الأكثر طلباً
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.2rem" }}>🚀 مميز</div>
                  <div className={styles.planPrice}>
                    500 دج{" "}
                    <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--muted)" }}>/شهر</span>
                  </div>
                  <ul style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--muted)", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <li>✓ كل مميزات الأساسي</li>
                    <li>✓ حتى 20 صورة أعمال</li>
                    <li>✓ ظهور في أعلى النتائج</li>
                    <li>✓ شارة "حرفي موثّق"</li>
                  </ul>
                </div>
              </div>

              {error && (
                <div className={styles.errorMsg}>⚠️ {error}</div>
              )}

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button id="step4-back" type="button" onClick={prevStep} className={styles.btnBack}>← رجوع</button>
                <button id="submit-register" type="submit" disabled={loading} className={styles.btnNext}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      جاري الإنشاء...
                    </span>
                  ) : "✓ إنشاء حسابي"}
                </button>
              </div>

              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
