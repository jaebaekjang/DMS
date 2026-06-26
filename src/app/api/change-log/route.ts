import { fail, ok, store } from "@/lib/api/server";
import { listChangeLog } from "@/services/historyService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listChangeLog(store());
    return ok({ items });
  } catch (e) {
    return fail(e);
  }
}
