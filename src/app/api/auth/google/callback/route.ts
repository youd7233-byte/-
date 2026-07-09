import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", req.url));
  }
  
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url));
  }

  try {
    const envKeyId = Object.keys(process.env).find(k => k.trim() === 'GOOGLE_CLIENT_ID');
    const clientId = envKeyId ? process.env[envKeyId]?.trim() : undefined;

    const envKeySecret = Object.keys(process.env).find(k => k.trim() === 'GOOGLE_CLIENT_SECRET');
    const clientSecret = envKeySecret ? process.env[envKeySecret]?.trim() : undefined;

    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error("Missing Google OAuth credentials");
    }

    // 1. Exchange code for access token & id token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || "Failed to get token");

    // 2. Fetch user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    const profileData = await profileRes.json();
    if (!profileRes.ok) throw new Error("Failed to fetch profile");

    const email = profileData.email;
    const name = profileData.name;
    const googleId = profileData.id;

    // 3. Find or Create User
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      },
      include: { artisanProfile: true }
    });

    if (!user) {
      // Create new user (NO password needed)
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          role: "ARTISAN", // Default role
        },
        include: { artisanProfile: true }
      });
    } else if (!user.googleId) {
      // Link existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
        include: { artisanProfile: true }
      });
    }

    // 4. Create Session
    await createSession(user.id, user.role, user.name);

    // 5. Redirect
    // If they don't have an artisan profile yet, send them to complete it
    if (!user.artisanProfile) {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }

    return NextResponse.redirect(new URL("/dashboard", req.url));

  } catch (error: any) {
    console.error("Google Callback Error:", error);
    const errorMessage = error?.message || "Unknown error";
    return NextResponse.redirect(new URL("/login?error=google_auth_error&details=" + encodeURIComponent(errorMessage), req.url));
  }
}
