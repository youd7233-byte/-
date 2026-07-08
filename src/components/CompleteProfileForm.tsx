"use client";

import { useState, useActionState, useRef } from "react";
import styles from "./ArtisanRegisterForm.module.css";
import { completeProfile } from "@/app/actions/complete-profile";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Map must be dynamic to avoid SSR issues
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "300px", background: "var(--sand)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
      جاري تحميل الخريطة...
    </div>
  ),
});

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
  { label: "الاتصال والمكان" },
  { label: "معلومات الحرفة" },
  { label: "صور الأعمال" },
  { label: "الباقة" },
];

type FormFields = {
  phone: string;
  wilaya: string;
  city: string;
  profession: string;
  specialty: string;
  experience: string;
  range: string;
  bio: string;
};

const INITIAL_FIELDS: FormFields = {
  phone: "",
  wilaya: "", city: "", profession: "",
  specialty: "", experience: "1–3 سنوات", range: "10 كم", bio: "",
};

export default function CompleteProfileForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [stepError, setStepError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const [actionState, formAction, isPending] = useActionState(
    completeProfile,
    undefined
  );

  // Handle successful registration → redirect to dashboard
  if (actionState?.success) {
    router.push("/dashboard");
  }

  const updateField = (field: keyof FormFields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setStepError("");
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!/^(0)(5|6|7)[0-9]{8}$/.test(fields.phone.replace(/\s+/g, ""))) {
        setStepError("يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555000000)");
        return false;
      }
      if (!fields.wilaya) {
        setStepError("يرجى اختيار الولاية");
        return false;
      }
    }
    if (step === 2) {
      if (!fields.profession) {
        setStepError("يرجى اختيار الحِرفة");
        return false;
      }
      if (!location) {
        setStepError("يرجى تحديد موقعك على الخريطة بالضغط عليها");
        return false;
      }
    }
    setStepError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStepError("");
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Success Screen ── */
  if (actionState?.success) {
    return (
      <div className={styles.successScreen}>
        <div style={{ fontSize: "5rem", marginBottom: "1.5rem", animation: "fadeUp 0.5s ease" }}>🎉</div>
        <h2>تم الحفظ بنجاح!</h2>
        <p style={{ marginBottom: "2rem" }}>
          مرحباً بك في منصة حِرَفي. جاري تحويلك إلى لوحة التحكم...
        </p>
      </div>
    );
  }

  const serverError = actionState?.success === false ? actionState.error : "";
  const displayError = stepError || serverError;

  return (
    <div className={styles.container}>
      {/* ── Side Panel ── */}
      <aside className={styles.sidePanel}>
        <h2>
          أكمل ملفك<br />
          و<em>ابدأ بتلقي طلبات</em>
        </h2>
        <p>العملاء يبحثون عن محترفين مثلك. أكمل بياناتك لتظهر في نتائج البحث.</p>

        {[
          { icon: "📍", title: "ظهور على الخريطة", desc: "يراك العملاء مباشرة على الخريطة حسب موقعك الجغرافي" },
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
      </aside>

      {/* ── Form Area ── */}
      <div className={styles.formWrap}>
        {/* Steps Bar */}
        <div className={styles.stepsIndicator}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`${styles.stepDot} ${step > i ? styles.stepDotActive : ""}`}
              title={s.label}
              aria-label={s.label}
            />
          ))}
        </div>

        <div className={styles.formContainer}>
          {/* Error Banner */}
          {displayError && (
            <div
              role="alert"
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                color: "#c53030",
                fontSize: "0.9rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
              }}
            >
              ⚠️ {displayError}
            </div>
          )}

          <form ref={formRef} action={formAction}>
            <input type="hidden" name="phone" value={fields.phone} />
            <input type="hidden" name="wilaya" value={fields.wilaya} />
            <input type="hidden" name="city" value={fields.city} />
            <input type="hidden" name="profession" value={fields.profession} />
            <input type="hidden" name="specialty" value={fields.specialty} />
            <input type="hidden" name="bio" value={fields.bio} />
            <input type="hidden" name="plan" value={plan} />
            {location && (
              <>
                <input type="hidden" name="lat" value={location.lat} />
                <input type="hidden" name="lng" value={location.lng} />
              </>
            )}

            {/* ── Step 1: Contact & Location ── */}
            {step === 1 && (
              <div className="animate-fade-up">
                <h2 className={styles.title}>كيف يتواصل معك العملاء؟</h2>
                <p className={styles.subtitle}>الخطوة 1 من 4 — أضف رقمك ومنطقتك</p>

                <div className={styles.field}>
                  <label htmlFor="field-phone">رقم الهاتف <span>*</span></label>
                  <input
                    id="field-phone"
                    type="tel"
                    className={styles.input}
                    placeholder="0555 000 000"
                    dir="ltr"
                    value={fields.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label htmlFor="field-wilaya">الولاية <span>*</span></label>
                    <select
                      id="field-wilaya"
                      className={styles.select}
                      value={fields.wilaya}
                      onChange={(e) => updateField("wilaya", e.target.value)}
                    >
                      <option value="">اختر الولاية...</option>
                      {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="field-city">البلدية / الحي</label>
                    <input
                      id="field-city"
                      type="text"
                      className={styles.input}
                      placeholder="مثال: حي الصنوبر"
                      value={fields.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem" }}>
                  <button id="step1-next" type="button" onClick={nextStep} className={styles.btnNext}>
                    المتابعة للخطوة التالية
                    <span style={{ fontSize: "1.2rem" }}>←</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Craft Info ── */}
            {step === 2 && (
              <div className="animate-fade-up">
                <h2 className={styles.title}>معلومات الحِرفة</h2>
                <p className={styles.subtitle}>الخطوة 2 من 4 — تفاصيل عملك</p>

                <div className={styles.field}>
                  <label htmlFor="field-profession">نوع الحِرفة <span>*</span></label>
                  <select
                    id="field-profession"
                    className={styles.select}
                    value={fields.profession}
                    onChange={(e) => updateField("profession", e.target.value)}
                  >
                    <option value="">اختر الحِرفة...</option>
                    {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="field-specialty">التخصص الدقيق</label>
                  <input
                    id="field-specialty"
                    type="text"
                    className={styles.input}
                    placeholder="مثال: مطابخ وخزائن مصمتة، نجارة تقليدية..."
                    value={fields.specialty}
                    onChange={(e) => updateField("specialty", e.target.value)}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label htmlFor="field-experience">سنوات الخبرة</label>
                    <select
                      id="field-experience"
                      className={styles.select}
                      value={fields.experience}
                      onChange={(e) => updateField("experience", e.target.value)}
                    >
                      <option>أقل من سنة</option>
                      <option>1–3 سنوات</option>
                      <option>3–7 سنوات</option>
                      <option>7–15 سنة</option>
                      <option>أكثر من 15 سنة</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="field-range">نطاق التنقل</label>
                    <select
                      id="field-range"
                      className={styles.select}
                      value={fields.range}
                      onChange={(e) => updateField("range", e.target.value)}
                    >
                      <option>5 كم</option>
                      <option>10 كم</option>
                      <option>20 كم</option>
                      <option>30 كم</option>
                      <option>الولاية كاملة</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>حدد موقع ورشتك على الخريطة <span>*</span></label>
                  <MapPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                  {location && (
                    <p style={{ fontSize: "0.8rem", color: "var(--green)", marginTop: "0.4rem", fontWeight: 700 }}>
                      ✓ تم تحديد الموقع: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="field-bio">وصف عملك</label>
                  <textarea
                    id="field-bio"
                    className={styles.textarea}
                    rows={4}
                    placeholder="اكتب هنا وصفاً لخدماتك، تخصصاتك، ونوع المشاريع التي تنجزها..."
                    value={fields.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button id="step2-back" type="button" onClick={prevStep} className={styles.btnBack}>→ رجوع</button>
                  <button id="step2-next" type="button" onClick={nextStep} className={styles.btnNext}>
                    التالي <span style={{ fontSize: "1.2rem" }}>←</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Photos ── */}
            {step === 3 && (
              <div className="animate-fade-up">
                <h2 className={styles.title}>صور أعمالك</h2>
                <p className={styles.subtitle}>الخطوة 3 من 4 — أضف صور تجذب العملاء</p>

                <div className={styles.field}>
                  <label>صورة الملف الشخصي</label>
                  <div className={styles.uploadZone} onClick={() => document.getElementById("upload-avatar")?.click()}>
                    <input id="upload-avatar" name="avatar" type="file" accept="image/*" style={{ display: "none" }} />
                    <div className={styles.uploadIcon}>🤳</div>
                    <p>
                      <strong style={{ fontSize: "1.1rem", color: "var(--dark)" }}>اضغط للرفع</strong>
                      <br />
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>صورة واضحة لوجهك أو شعار ورشتك</span>
                    </p>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>صور الأعمال <span style={{ color: "var(--muted)", fontWeight: 400 }}>(حتى 10 صور)</span></label>
                  <div className={styles.uploadZone} onClick={() => document.getElementById("upload-works")?.click()}>
                    <input id="upload-works" name="works" type="file" accept="image/*" multiple style={{ display: "none" }} />
                    <div className={styles.uploadIcon}>🖼️</div>
                    <p>
                      <strong style={{ fontSize: "1.1rem", color: "var(--dark)" }}>اضغط لرفع الصور</strong>
                      <br />
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>JPG, PNG — الحجم الأقصى 5MB لكل صورة</span>
                      <br />
                      <span style={{ fontSize: "0.85rem", color: "var(--terracotta)", fontWeight: 800, marginTop: "0.5rem", display: "block" }}>
                        صور الأعمال تزيد الطلبات بنسبة 3 أضعاف! 🚀
                      </span>
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button id="step3-back" type="button" onClick={prevStep} className={styles.btnBack}>→ رجوع</button>
                  <button id="step3-next" type="button" onClick={nextStep} className={styles.btnNext}>
                    التالي <span style={{ fontSize: "1.2rem" }}>←</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 4: Plan ── */}
            {step === 4 && (
              <div className="animate-fade-up">
                <h2 className={styles.title}>اختر باقتك</h2>
                <p className={styles.subtitle}>الخطوة 4 من 4 — ابدأ مجاناً أو احصل على ظهور أكثر</p>

                <div className={styles.plans}>
                  {/* Free Plan */}
                  <div
                    id="plan-free"
                    className={`${styles.planCard} ${plan === "free" ? styles.planCardSelected : ""}`}
                    onClick={() => setPlan("free")}
                    role="radio"
                    aria-checked={plan === "free"}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setPlan("free")}
                  >
                    <div style={{ fontWeight: 900, fontSize: "1.1rem", marginBottom: "0.5rem", color: "var(--dark)" }}>🆓 أساسي</div>
                    <div className={styles.planPrice}>
                      مجاني{" "}
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)" }}>للأبد</span>
                    </div>
                    <ul style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--muted)", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", padding: 0 }}>
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
                    role="radio"
                    aria-checked={plan === "pro"}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setPlan("pro")}
                  >
                    <div style={{
                      position: "absolute", top: "-14px", right: "20px",
                      background: "var(--gold)", color: "var(--dark)",
                      padding: "4px 14px", borderRadius: "999px",
                      fontSize: "0.75rem", fontWeight: 900,
                      boxShadow: "0 4px 12px rgba(212,168,67,0.3)",
                    }}>
                      ⭐ الأكثر طلباً
                    </div>
                    <div style={{ fontWeight: 900, fontSize: "1.1rem", marginBottom: "0.5rem", color: "var(--dark)" }}>🚀 مميز</div>
                    <div className={styles.planPrice}>
                      500 دج{" "}
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)" }}>/شهر</span>
                    </div>
                    <ul style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--muted)", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", padding: 0 }}>
                      <li style={{ color: "var(--dark)", fontWeight: 700 }}>✓ كل مميزات الأساسي</li>
                      <li>✓ حتى 20 صورة أعمال</li>
                      <li>✓ ظهور في أعلى النتائج</li>
                      <li>✓ شارة "حرفي موثّق"</li>
                    </ul>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button id="step4-back" type="button" onClick={prevStep} className={styles.btnBack}>→ رجوع</button>
                  <button
                    id="submit-register"
                    type="submit"
                    disabled={isPending}
                    className={styles.btnNext}
                    aria-busy={isPending}
                  >
                    {isPending ? (
                      <>
                        <span style={{
                          display: "inline-block", width: "18px", height: "18px",
                          border: "3px solid rgba(255,255,255,0.4)",
                          borderTopColor: "#fff", borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }} />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>✓ حفظ ملفي الشخصي</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
