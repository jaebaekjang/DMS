import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConfig, saveConfig } from "@/lib/site/store";
import { verifySession, ADMIN_COOKIE } from "@/lib/site/auth";
import { mergeConfig, type SiteConfig } from "@/lib/site/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySession(token);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json(await getConfig());
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, message: "인증이 필요합니다." }, { status: 401 });
  }
  let body: Partial<SiteConfig>;
  try {
    body = (await req.json()) as Partial<SiteConfig>;
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  const current = await getConfig();
  // 전달된 섹션만 병합 저장
  const next = mergeConfig({ ...current, ...body });
  await saveConfig(next);
  return NextResponse.json({ ok: true, config: next });
}
