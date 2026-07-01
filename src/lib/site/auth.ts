// ===== 어드민 세션 서명/검증 + 입력 정제 (Web Crypto 기반, Edge 미들웨어 호환) =====

const enc = new TextEncoder();

function adminSecret(): string {
  return (
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dms-dev-secret-change-me"
  );
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "change-me-now";
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(adminSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return base64url(new Uint8Array(sig));
}

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// 세션 토큰: base64url(payload).signature  (payload = {exp})
export async function createSession(maxAgeSec = 60 * 60 * 12): Promise<string> {
  const payload = { exp: Date.now() + maxAgeSec * 1000 };
  const body = base64url(enc.encode(JSON.stringify(payload)));
  const sig = await hmac(body);
  return `${body}.${sig}`;
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [body, sig] = token.split(".");
  const expected = await hmac(body);
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const json = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" && json.exp > Date.now();
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  return timingSafeEqual(input || "", expected);
}

export async function hashIp(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode("dms-salt:" + ip));
  return base64url(new Uint8Array(buf)).slice(0, 16);
}

export const ADMIN_COOKIE = "dms_admin";

// ===== 입력 정제: 제어문자 제거(\t \n \r 보존) + 길이 제한 =====
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]",
  "g"
);

export function clean(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  const trimmed = s.replace(CONTROL_CHARS, "").trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function isValidPhone(p: string): boolean {
  return /^[0-9+\-\s()]{7,20}$/.test(p);
}
