import { fail, ok, store } from "@/lib/api/server";
import { runArchiveSweep } from "@/services/archiveService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 아카이브 대상(계약완료/이탈/종료/삭제됨/비활성) 일괄 처리
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runArchiveSweep(store(), body.actor ?? "");
    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
