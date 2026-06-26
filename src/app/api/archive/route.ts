import { fail, ok, store } from "@/lib/api/server";
import { archiveLeadRecord, listArchiveLeads } from "@/services/archiveService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 아카이브된 리드 목록
export async function GET() {
  try {
    const items = await listArchiveLeads(store());
    return ok({ items });
  } catch (e) {
    return fail(e);
  }
}

// 단일 리드 아카이브 처리
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await archiveLeadRecord(store(), body.leadId, body.actor ?? "");
    return ok({ archived: res.archived, skipped: res.skipped });
  } catch (e) {
    return fail(e);
  }
}
