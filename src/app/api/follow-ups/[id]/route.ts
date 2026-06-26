import { fail, ok, store } from "@/lib/api/server";
import { completeFollowUpFlow } from "@/services/crmService";
import { updateFollowUpRecord } from "@/services/followUpService";
import type { FollowUp } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const id = decodeURIComponent(params.id);
    const actor: string = body.actor ?? "";

    if (body.action === "complete") {
      const result = await completeFollowUpFlow(
        store(),
        id,
        body.completion,
        actor,
        body.opts
      );
      return ok(result);
    }

    const item = await updateFollowUpRecord(
      store(),
      id,
      (body.updates ?? {}) as Partial<FollowUp>,
      actor
    );
    return ok({ item });
  } catch (e) {
    return fail(e);
  }
}
