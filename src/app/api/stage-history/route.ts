import { fail, ok, store } from "@/lib/api/server";
import {
  listStageHistory,
  listStageHistoryByLead,
} from "@/services/historyService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const leadId = new URL(req.url).searchParams.get("leadId") ?? undefined;
    const items = leadId
      ? await listStageHistoryByLead(store(), leadId)
      : await listStageHistory(store());
    return ok({ items });
  } catch (e) {
    return fail(e);
  }
}
