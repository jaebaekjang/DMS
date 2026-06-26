import { fail, ok, store } from "@/lib/api/server";
import { restoreLeadRecord } from "@/services/archiveService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lead = await restoreLeadRecord(
      store(),
      body.leadId,
      body.actor ?? "",
      body.restoreStage
    );
    return ok({ lead });
  } catch (e) {
    return fail(e);
  }
}
