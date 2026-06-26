import { fail, ok, store } from "@/lib/api/server";
import { logAuthEvent, logExportEvent } from "@/services/crmService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 로그인/로그아웃 / 백업(EXPORT) 등 부수 기록
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.kind === "auth") {
      await logAuthEvent(store(), body.type, body.actor ?? "");
    } else if (body.kind === "export") {
      await logExportEvent(store(), body.actor ?? "", body.memo ?? "");
    }
    return ok({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
