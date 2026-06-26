import { fail, ok, store } from "@/lib/api/server";
import { createConsultationFlow } from "@/services/crmService";
import {
  listConsultations,
  listConsultationsByLead,
} from "@/services/consultationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const leadId = new URL(req.url).searchParams.get("leadId") ?? undefined;
    const items = leadId
      ? await listConsultationsByLead(store(), leadId)
      : await listConsultations(store());
    return ok({ items });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createConsultationFlow(
      store(),
      body.input,
      body.actor ?? "",
      body.opts
    );
    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
