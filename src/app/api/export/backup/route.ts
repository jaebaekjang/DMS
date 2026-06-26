import { fail, ok, store } from "@/lib/api/server";
import { logExportEvent, readAllTabsRaw } from "@/services/crmService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 전체 탭 raw 데이터 반환 (클라이언트에서 ZIP 으로 묶음) + EXPORT 로그
export async function GET(req: Request) {
  try {
    const actor = new URL(req.url).searchParams.get("actor") ?? "";
    const s = store();
    const tabs = await readAllTabsRaw(s);
    await logExportEvent(s, actor, "전체 데이터 백업(ZIP) 다운로드");
    return ok({ tabs });
  } catch (e) {
    return fail(e);
  }
}
