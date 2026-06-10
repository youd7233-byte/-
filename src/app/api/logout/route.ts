import { deleteSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await deleteSession();
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/", requestUrl.origin);
  // Status 303 (See Other) forces a GET request on redirect, which is standard for form POST redirection.
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
