/**
 * Session Management — Server Only
 * Uses Web Crypto API (crypto.subtle) — no external deps needed.
 * Passwords hashed with PBKDF2, sessions stored as signed cookies.
 */
import "server-only";
import { cookies } from "next/headers";

// ── Types ──────────────────────────────────────────────────────────────
export interface SessionPayload {
  userId: string;
  role: string;
  name: string;
  expiresAt: number; // Unix timestamp ms
}

// ── Helpers ────────────────────────────────────────────────────────────
const SESSION_COOKIE = "hirafi_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set in environment variables.");
  return secret;
}

/** Encode Uint8Array → base64url string */
function toBase64url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/** Decode base64url string → Buffer */
function fromBase64url(str: string): Buffer {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

/** Import HMAC key from the session secret */
async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSecret();
  const keyBytes = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// ── Session Token: sign & verify ───────────────────────────────────────
/** Create a signed session token: base64url(payload).base64url(sig) */
async function signToken(payload: SessionPayload): Promise<string> {
  const key = await getHmacKey();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = toBase64url(new TextEncoder().encode(payloadStr));
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const sigB64 = toBase64url(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

/** Verify and decode a session token. Returns null if invalid/expired. */
async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;

    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      new Uint8Array(fromBase64url(sigB64)),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payloadStr = new TextDecoder().decode(fromBase64url(payloadB64));
    const payload = JSON.parse(payloadStr) as SessionPayload;

    if (Date.now() > payload.expiresAt) return null; // expired

    return payload;
  } catch {
    return null;
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/** Hash a password using PBKDF2. Returns "salt:hash" string. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hashBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `${toBase64url(salt)}:${toBase64url(new Uint8Array(hashBits))}`;
}

/** Verify a password against a stored "salt:hash" string. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltB64, hashB64] = stored.split(":");
    if (!saltB64 || !hashB64) return false;
    const salt = new Uint8Array(fromBase64url(saltB64));
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const newHashBits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
      keyMaterial,
      256
    );
    // Constant-time compare
    const a = new Uint8Array(newHashBits);
    const b = fromBase64url(hashB64);
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  } catch {
    return false;
  }
}

/** Create a new session cookie for the given user. */
export async function createSession(
  userId: string,
  role: string,
  name: string
): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = await signToken({ userId, role, name, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Read and verify the current session. Returns null if none or invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/** Destroy the current session cookie. */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
