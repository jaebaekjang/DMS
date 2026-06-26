import { fail, ok, store } from "@/lib/api/server";
import { createFollowUpFlow } from "@/services/crmService";
import {
  listFollowUps,
  listFollowUpsByLead,
} from "@/services/followUpService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const leadId = new URL(req.url).searchParams.get("leadId") ?? undefined;
    const items = leadId
      ? await listFollowUpsByLead(store(), leadId)
      : await listFollowUps(store());
    return ok({ items });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createFollowUpFlow(
      store(),
      body.input,
      body.actor ?? ""
    );
    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
