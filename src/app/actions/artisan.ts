"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registerArtisan(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const wilaya = formData.get("wilaya") as string;
    const city = formData.get("city") as string;
    const profession = formData.get("profession") as string;
    const specialty = formData.get("specialty") as string;
    const experience = formData.get("experience") as string;
    const range = formData.get("range") as string;
    const bio = formData.get("bio") as string;
    const plan = formData.get("plan") as string;

    // Basic validation
    if (!name || !phone || !wilaya || !profession) {
      return { error: "يرجى ملء جميع الحقول المطلوبة" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return { error: "رقم الهاتف هذا مسجل بالفعل" };
    }

    // Create user and artisan profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          phone,
          password, // In a real app, hash this with bcrypt!
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
      return newUser;
    });

    revalidatePath("/");
    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى." };
  }
}
