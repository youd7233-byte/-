import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
  
  if (!clientId) {
    const googleKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('google'));
    return NextResponse.json({ 
      error: "Missing GOOGLE_CLIENT_ID environment variable",
      found_google_keys: googleKeys,
      hint: "أعد التحقق من اسم المتغير في Vercel"
    }, { status: 500 });
  }

  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=online`;

  return NextResponse.redirect(authUrl);
}
