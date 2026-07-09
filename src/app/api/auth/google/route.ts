import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // ── Helper: Find env var even if user accidentally added a space in Vercel ──
  const envKey = Object.keys(process.env).find(k => k.trim() === 'GOOGLE_CLIENT_ID');
  const clientId = envKey ? process.env[envKey]?.trim() : undefined;

  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
  
  if (!clientId) {

  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=online`;

  return NextResponse.redirect(authUrl);
}
