"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

type ActionResult = { success: true } | { success: false; error: string };

export async function completeProfile(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let userId: string | null = null;
  
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "يجب تسجيل الدخول أولاً" };
    }
    userId = session.userId;

    const phone = (formData.get("phone") as string)?.trim().replace(/\s+/g, "");
    const wilaya = formData.get("wilaya") as string;
    const city = (formData.get("city") as string)?.trim();
    const profession = formData.get("profession") as string;
    const specialty = (formData.get("specialty") as string)?.trim();
    const bio = (formData.get("bio") as string)?.trim();
    const plan = formData.get("plan") as string;
    const latStr = formData.get("lat") as string;
    const lngStr = formData.get("lng") as string;

    if (!phone || !wilaya || !profession) {
      return { success: false, error: "يرجى ملء الحقول المطلوبة (الهاتف، الولاية، الحرفة)" };
    }
    if (!latStr || !lngStr) {
      return { success: false, error: "يرجى تحديد موقعك على الخريطة" };
    }
    if (!/^(0)(5|6|7)[0-9]{8}$/.test(phone)) {
      return { success: false, error: "يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555000000)" };
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) {
      return { success: false, error: "بيانات الموقع غير صحيحة" };
    }

    // Check if phone exists for ANOTHER user
    const existingPhoneUser = await prisma.user.findUnique({ where: { phone } });
    if (existingPhoneUser && existingPhoneUser.id !== userId) {
      return { success: false, error: "رقم الهاتف هذا مسجل بالفعل لحساب آخر" };
    }

    // Update user phone & create artisan profile
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId! },
        data: { phone },
      });

      await tx.artisanProfile.create({
        data: {
          userId: userId!,
          profession,
          wilaya,
          city: city || null,
          lat,
          lng,
          bio: `${specialty ? `التخصص: ${specialty}\n` : ""}${bio || ""}`.trim() || null,
          isPremium: plan === "pro",
        },
      });
    });

  } catch (error) {
    console.error("Complete profile error:", error);
    if (error instanceof Error && "code" in error && (error as any).code === "P2002") {
      return { success: false, error: "رقم الهاتف مستخدم بالفعل" };
    }
    return { success: false, error: "حدث خطأ أثناء حفظ البيانات" };
  }

  // Redirect outside try-catch
  redirect("/dashboard");
}
