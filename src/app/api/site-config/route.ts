import { NextResponse } from "next/server";
import { getConfig } from "@/lib/site/store";
import { toPublicConfig } from "@/lib/site/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 공개 설정(디자인/팝업/공개 트래킹 ID). 비밀값·관리자 알림 정보는 포함하지 않는다.
export async function GET() {
  const config = await getConfig();
  return NextResponse.json(toPublicConfig(config), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
