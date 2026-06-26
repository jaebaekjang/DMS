import { fail, ok, store } from "@/lib/api/server";
import { softDeleteLead } from "@/services/leadService";
import { updateLeadFlow } from "@/services/crmService";
import type { Lead, LeadStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const body = await req.json();
    const actor: string = body.actor ?? "";
    const leadId = decodeURIComponent(params.leadId);

    if (body.action === "soft-delete") {
      await softDeleteLead(store(), leadId, body.status as LeadStatus, actor);
      return ok({ ok: true });
    }

    const result = await updateLeadFlow(
      store(),
      leadId,
      (body.updates ?? {}) as Partial<Lead>,
      actor,
      body.opts
    );
    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
