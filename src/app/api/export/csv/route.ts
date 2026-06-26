import { fail, store } from "@/lib/api/server";
import { toCsv } from "@/lib/csv";
import { ALL_TABS, HEADERS, type TabName } from "@/lib/sheets/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 특정 탭 CSV 다운로드 (bonus 엔드포인트). 일반적으로는 클라이언트에서 필터 결과로 생성.
export async function GET(req: Request) {
  try {
    const tab = new URL(req.url).searchParams.get("tab") as TabName | null;
    if (!tab || !ALL_TABS.includes(tab)) {
      return fail("유효한 tab 파라미터가 필요합니다.", 400);
    }
    const rows = await store().readTab(tab);
    const csv = toCsv(HEADERS[tab], rows);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          tab
        )}.csv"`,
      },
    });
  } catch (e) {
    return fail(e);
  }
}
