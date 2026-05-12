"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registerArtisan(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const wilaya = formData.get("wilaya") as string;
    const city = formData.get("city") as string;
    const profession = formData.get("profession") as string;
    const specialty = formData.get("specialty") as string;
    const bio = formData.get("bio") as string;
    const plan = formData.get("plan") as string;

    // 1. Strict Validation
    if (!name || !phone || !email || !password || !wilaya || !profession) {
      return { success: false, error: "يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، البريد، كلمة المرور، الولاية، الحرفة)" };
    }

    if (!email.includes("@")) {
      return { success: false, error: "يرجى إدخال بريد إلكتروني صحيح" };
    }

    if (phone.length < 9) {
      return { success: false, error: "رقم الهاتف غير صحيح" };
    }

    // 2. Check for duplicates
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      return { success: false, error: "رقم الهاتف هذا مسجل بالفعل، يرجى تسجيل الدخول" };
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return { success: false, error: "البريد الإلكتروني هذا مستخدم بالفعل، يرجى استخدام بريد آخر" };
    }

    // 3. Create user and artisan profile in a transaction
    const user = await prisma.$transaction(async (tx: any) => {
      return await tx.user.create({
        data: {
          name,
          phone,
          email,
          password, // In a real production app, hash this!
          role: "ARTISAN",
          artisanProfile: {
            create: {
              profession,
              wilaya,
              city,
              bio: `${specialty ? `التخصص: ${specialty}\n` : ""}${bio}`,
              isPremium: plan === "pro",
            },
          },
        },
      });
    });

    revalidatePath("/");
    return { success: true, userId: user.id };

  } catch (error: any) {
    console.error("Registration error:", error);
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return { success: false, error: "هذه البيانات (الهاتف أو البريد) مستخدمة بالفعل" };
    }
    return { success: false, error: "حدث خطأ غير متوقع أثناء التسجيل. يرجى المحاولة لاحقاً." };
  }
}
