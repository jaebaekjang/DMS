import { fail, ok, store } from "@/lib/api/server";
import { listSnapshots, listSnapshotsByLead } from "@/services/historyService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const leadId = new URL(req.url).searchParams.get("leadId") ?? undefined;
    const items = leadId
      ? await listSnapshotsByLead(store(), leadId)
      : await listSnapshots(store());
    return ok({ items });
  } catch (e) {
    return fail(e);
  }
}
