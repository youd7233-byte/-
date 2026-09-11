import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  // ── Helper: Find env var even if user accidentally added a space in Vercel ──
  const envKey = Object.keys(process.env).find(k => k.trim() === 'GOOGLE_CLIENT_ID');
  const clientId = envKey ? process.env[envKey]?.trim() : undefined;

  // Use environment variable for production/preview or fallback to request origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID environment variable" }, { status: 500 });
  }

  // 🔒 CSRF Protection: Generate secure state token and store in cookie
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });
  
  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&access_type=online&prompt=select_account`;

  return NextResponse.redirect(authUrl);
}
