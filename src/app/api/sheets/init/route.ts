import { fail, ok, store } from "@/lib/api/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 구글시트 초기화: 탭/헤더만 준비 (기존 데이터는 삭제하지 않음)
export async function POST() {
  try {
    await store().ensureSheets();
    return ok({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
