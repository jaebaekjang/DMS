import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, ADMIN_COOKIE } from "@/lib/site/auth";
import { STORE_MODE } from "@/lib/site/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 서버 비밀값 설정 여부만 boolean 으로 노출한다(값 자체는 절대 반환하지 않음).
export async function GET() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!(await verifySession(token))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({
    ga4SecretSet: Boolean(process.env.GA4_API_SECRET),
    metaTokenSet: Boolean(process.env.META_CAPI_TOKEN),
    messagingSet: Boolean(process.env.MSG_PROVIDER_URL && process.env.MSG_API_KEY),
    storeMode: STORE_MODE,
  });
}
