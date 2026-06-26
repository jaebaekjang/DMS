// ===== Google Sheets 연동 (서버 전용) =====
// 프론트엔드에서 직접 호출하지 않는다. API route 에서만 사용.
// GOOGLE_* 환경변수가 프론트엔드로 노출되지 않도록 NEXT_PUBLIC_ 접두사를 쓰지 않는다.

import "server-only";
import { google, type sheets_v4 } from "googleapis";
import { ALL_TABS, HEADERS, TABS, type TabName } from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";

let cachedClient: sheets_v4.Sheets | null = null;

function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error(
      "GOOGLE_SHEET_ID 환경변수가 설정되지 않았습니다. (.env.local 확인)"
    );
  }
  return id;
}

function getClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY 환경변수가 필요합니다."
    );
  }
  // .env 에 \n 으로 escape 된 줄바꿈 복원
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

function quote(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'`;
}

class GoogleSheetStore implements SheetStore {
  async ensureSheets(): Promise<void> {
    const sheets = getClient();
    const spreadsheetId = getSheetId();

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const existing = new Set(
      (meta.data.sheets ?? [])
        .map((s) => s.properties?.title)
        .filter((t): t is string => Boolean(t))
    );

    // 1) 없는 탭 생성
    const toCreate = ALL_TABS.filter((t) => !existing.has(t));
    if (toCreate.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: toCreate.map((title) => ({
            addSheet: { properties: { title } },
          })),
        },
      });
    }

    // 2) 각 탭 헤더 보정 (기존 데이터 행은 유지, 1행만 점검/갱신)
    for (const tab of ALL_TABS) {
      const headers = HEADERS[tab];
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${quote(tab)}!1:1`,
      });
      const current = (res.data.values?.[0] ?? []) as string[];
      const matches =
        current.length === headers.length &&
        headers.every((h, i) => current[i] === h);
      if (!matches) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${quote(tab)}!A1`,
          valueInputOption: "RAW",
          requestBody: { values: [headers] },
        });
      }
    }
  }

  async readTab(tab: TabName): Promise<string[][]> {
    const sheets = getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: getSheetId(),
      range: `${quote(tab)}!A2:ZZ`,
    });
    const rows = (res.data.values ?? []) as string[][];
    // 완전히 빈 행 제외
    return rows.filter((r) => r.some((c) => c !== undefined && c !== ""));
  }

  async appendRows(tab: TabName, rows: string[][]): Promise<void> {
    if (rows.length === 0) return;
    const sheets = getClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: getSheetId(),
      range: `${quote(tab)}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: rows },
    });
  }

  async updateRowByColumn(
    tab: TabName,
    columnIndex: number,
    matchValue: string,
    values: string[]
  ): Promise<boolean> {
    const sheets = getClient();
    const spreadsheetId = getSheetId();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${quote(tab)}!A2:ZZ`,
    });
    const rows = (res.data.values ?? []) as string[][];
    const idx = rows.findIndex((r) => (r[columnIndex] ?? "") === matchValue);
    if (idx === -1) return false;
    const rowNumber = idx + 2; // 헤더(1행) 다음부터
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quote(tab)}!A${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [values] },
    });
    return true;
  }
}

let storeSingleton: GoogleSheetStore | null = null;

export function getGoogleStore(): SheetStore {
  if (!storeSingleton) storeSingleton = new GoogleSheetStore();
  return storeSingleton;
}

export { TABS };
