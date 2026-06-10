"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createSession, deleteSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────
type ActionResult = { success: true } | { success: false; error: string };

// ── Register Artisan ───────────────────────────────────────────────────
export async function registerArtisan(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const wilaya = formData.get("wilaya") as string;
    const city = (formData.get("city") as string)?.trim();
    const profession = formData.get("profession") as string;
    const specialty = (formData.get("specialty") as string)?.trim();
    const bio = (formData.get("bio") as string)?.trim();
    const plan = formData.get("plan") as string;
    const latStr = formData.get("lat") as string;
    const lngStr = formData.get("lng") as string;

    // ── Validation ──
    if (!name || !phone || !email || !password || !wilaya || !profession) {
      return { success: false, error: "يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، البريد، كلمة المرور، الولاية، الحرفة)" };
    }
    if (!latStr || !lngStr) {
      return { success: false, error: "يرجى تحديد موقعك على الخريطة" };
    }
    if (name.length < 2) {
      return { success: false, error: "الاسم يجب أن يكون حرفين على الأقل" };
    }
    if (!/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/.test(email)) {
      return { success: false, error: "يرجى إدخال بريد إلكتروني صحيح" };
    }
    if (!/^(0)(5|6|7)[0-9]{8}$/.test(phone.replace(/\s+/g, ""))) {
      return { success: false, error: "يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555000000)" };
    }
    if (password.length < 8) {
      return { success: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) {
      return { success: false, error: "بيانات الموقع غير صحيحة" };
    }

    // ── Check duplicates ──
    const [existingPhone, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { phone: phone.replace(/\s+/g, "") } }),
      prisma.user.findUnique({ where: { email } }),
    ]);

    if (existingPhone) return { success: false, error: "رقم الهاتف هذا مسجل بالفعل، يرجى تسجيل الدخول" };
    if (existingEmail) return { success: false, error: "البريد الإلكتروني هذا مستخدم بالفعل، يرجى استخدام بريد آخر" };

    // ── Hash password (PBKDF2 — never store plain text!) ──
    const hashedPassword = await hashPassword(password);

    // ── Create user + artisan profile in transaction ──
    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name,
          phone: phone.replace(/\s+/g, ""),
          email,
          password: hashedPassword,
          role: "ARTISAN",
          artisanProfile: {
            create: {
              profession,
              wilaya,
              city: city || null,
              lat,
              lng,
              bio: `${specialty ? `التخصص: ${specialty}\n` : ""}${bio || ""}`.trim() || null,
              isPremium: plan === "pro",
            },
          },
        },
      });
    });

    // ── Auto-login after registration ──
    await createSession(user.id, user.role, user.name);
    revalidatePath("/");

  } catch (error: unknown) {
    console.error("Registration error:", error);
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return { success: false, error: "هذه البيانات (الهاتف أو البريد) مستخدمة بالفعل" };
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: "حدث خطأ: " + errMsg };
  }

  // redirect OUTSIDE try/catch so Next.js can handle it properly
  redirect("/dashboard");
}

// ── Login Artisan ──────────────────────────────────────────────────────
export async function loginArtisan(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  // NOTE: redirect() throws internally — must be called OUTSIDE try/catch
  let userId: string | null = null;
  let userRole: string | null = null;
  let userName: string | null = null;

  try {
    const phone = (formData.get("phone") as string)?.trim().replace(/\s+/g, "");
    const password = formData.get("password") as string;

    if (!phone || !password) {
      return { success: false, error: "يرجى إدخال رقم الهاتف وكلمة المرور" };
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return { success: false, error: "رقم الهاتف أو كلمة المرور غير صحيحة" };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, error: "رقم الهاتف أو كلمة المرور غير صحيحة" };
    }

    userId = user.id;
    userRole = user.role;
    userName = user.name;

  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً." };
  }

  // Create session and redirect OUTSIDE try/catch
  await createSession(userId!, userRole!, userName!);
  redirect("/dashboard");
}

// ── Logout ─────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}

// ── Get Artisans (for search page) ────────────────────────────────────
export async function getArtisans(profession?: string, wilaya?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (profession) where.profession = profession;
    if (wilaya) where.wilaya = wilaya;

    const artisans = await prisma.artisanProfile.findMany({
      where,
      include: {
        user: {
          select: { name: true, phone: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [{ isPremium: "desc" }, { isVerified: "desc" }],
      take: 100,
    });

    return {
      success: true,
      data: artisans.map((a) => ({
        id: a.id,
        name: a.user.name,
        profession: a.profession,
        wilaya: a.wilaya,
        city: a.city,
        lat: a.lat,
        lng: a.lng,
        phone: a.user.phone,
        isPremium: a.isPremium,
        isVerified: a.isVerified,
        bio: a.bio,
        avgRating:
          a.reviews.length > 0
            ? Math.round((a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length) * 10) / 10
            : null,
        reviewCount: a.reviews.length,
      })),
    };
  } catch (error) {
    console.error("Error fetching artisans:", error);
    return { success: false, error: "فشل في تحميل بيانات الحرفيين", data: [] };
  }
}

// ── Get Artisan Profile (for profile page) ─────────────────────────────
export async function getArtisanById(id: string) {
  try {
    const profile = await prisma.artisanProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true, email: true, createdAt: true } },
        reviews: {
          include: { client: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        portfolios: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!profile) return { success: false, error: "لم يتم العثور على الحرفي" };

    return {
      success: true,
      data: {
        id: profile.id,
        name: profile.user.name,
        phone: profile.user.phone,
        profession: profile.profession,
        wilaya: profile.wilaya,
        city: profile.city,
        bio: profile.bio,
        lat: profile.lat,
        lng: profile.lng,
        isPremium: profile.isPremium,
        isVerified: profile.isVerified,
        memberSince: profile.user.createdAt,
        reviews: profile.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          clientName: r.client.name,
          createdAt: r.createdAt,
        })),
        portfolios: profile.portfolios.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          description: p.description,
        })),
        avgRating:
          profile.reviews.length > 0
            ? Math.round(
                (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length) * 10
              ) / 10
            : null,
      },
    };
  } catch (error) {
    console.error("Error fetching artisan:", error);
    return { success: false, error: "حدث خطأ أثناء تحميل الملف الشخصي" };
  }
}
