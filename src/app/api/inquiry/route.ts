import { NextResponse } from "next/server";
import { getConfig, addInquiry, type Inquiry } from "@/lib/site/store";
import { dispatchIntegrations } from "@/lib/site/integrations";
import { clean, hashIp, isValidPhone } from "@/lib/site/auth";
import { rateLimit, clientIp } from "@/lib/site/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_PER_MIN = Number(process.env.INQUIRY_RATE_PER_MINUTE || "5");

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`inquiry:${ip}`, RATE_PER_MIN)) {
    return NextResponse.json(
      { ok: false, message: "잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  // 허니팟: 사람은 비워둠. 값이 있으면 봇.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const storeName = clean(body.storeName, 100);
  const phone = clean(body.phone, 20);
  if (!storeName) {
    return NextResponse.json({ ok: false, message: "매장명을 입력해주세요." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ ok: false, message: "연락처를 정확히 입력해주세요." }, { status: 400 });
  }

  const rawIssues = Array.isArray(body.issues) ? (body.issues as unknown[]) : [];
  const issues = rawIssues
    .map((it) => clean(it, 60))
    .filter((it) => it.length > 0)
    .slice(0, 20);

  const inquiry: Inquiry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    storeName,
    phone,
    region: clean(body.region, 50),
    issues,
    industry: clean(body.industry, 60),
    size: clean(body.size, 60),
    message: clean(body.message, 2000),
    sourceUrl: clean(body.sourceUrl, 500),
    ipHash: await hashIp(ip),
    status: "신규",
  };

  const config = await getConfig();
  await addInquiry(inquiry);
  // 연동 발송 실패는 접수 성공에 영향 주지 않음
  try {
    await dispatchIntegrations(inquiry, config);
  } catch {
    /* best-effort */
  }

  return NextResponse.json({
    ok: true,
    id: inquiry.id,
    message: "상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.",
  });
}
