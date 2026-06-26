import { fail, ok, store } from "@/lib/api/server";
import { updateConsultationRecord } from "@/services/consultationService";
import type { Consultation } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const item = await updateConsultationRecord(
      store(),
      decodeURIComponent(params.id),
      (body.updates ?? {}) as Partial<Consultation>,
      body.actor ?? ""
    );
    return ok({ item });
  } catch (e) {
    return fail(e);
  }
}
