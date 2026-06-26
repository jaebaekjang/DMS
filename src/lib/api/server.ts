// API route 공용 헬퍼 (서버 전용)
import { NextResponse } from "next/server";
import { getGoogleStore } from "@/services/googleSheetsService";
import type { SheetStore } from "@/lib/sheets/store";

export function store(): SheetStore {
  return getGoogleStore();
}

export function ok(data: unknown): NextResponse {
  return NextResponse.json(data);
}

export function fail(error: unknown, status = 500): NextResponse {
  const message = error instanceof Error ? error.message : String(error);
  return NextResponse.json({ error: message }, { status });
}
