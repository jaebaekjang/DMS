import { fail, ok, store } from "@/lib/api/server";
import { listLeads } from "@/services/leadService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await listLeads(store());
    return ok({ leads });
  } catch (e) {
    return fail(e);
  }
}
