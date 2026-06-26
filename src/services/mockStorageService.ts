// ===== Mock 저장소 (localStorage 기반, 클라이언트 전용) =====
// NEXT_PUBLIC_USE_MOCK_DATA=true 일 때 Google Sheets 없이 동작.
// 각 탭을 localStorage 키 하나(JSON 배열의 배열)로 저장하고, 최초 1회 시드한다.

import { getSeedData } from "@/data/mockData";
import { ALL_TABS, type TabName } from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";

const PREFIX = "dms_crm:";
const SEEDED_FLAG = "dms_crm:__seeded__";

function keyFor(tab: TabName): string {
  return PREFIX + tab;
}

function readRows(tab: TabName): string[][] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(keyFor(tab));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[][]) : [];
  } catch {
    return [];
  }
}

function writeRows(tab: TabName, rows: string[][]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(tab), JSON.stringify(rows));
}

class MockSheetStore implements SheetStore {
  async ensureSheets(): Promise<void> {
    if (typeof window === "undefined") return;
    // 최초 1회만 시드 (이후에는 기존 데이터 유지 — 절대 덮어쓰지 않음)
    const seeded = window.localStorage.getItem(SEEDED_FLAG);
    if (!seeded) {
      const seed = getSeedData();
      for (const tab of ALL_TABS) {
        const rows = seed[tab] ?? [];
        // 이미 데이터가 있으면 보존
        if (readRows(tab).length === 0) writeRows(tab, rows);
      }
      window.localStorage.setItem(SEEDED_FLAG, new Date().toISOString());
    } else {
      // 누락된 탭 키만 빈 배열로 보정 (헤더 보정과 동일한 의미)
      for (const tab of ALL_TABS) {
        if (window.localStorage.getItem(keyFor(tab)) === null) {
          writeRows(tab, []);
        }
      }
    }
  }

  async readTab(tab: TabName): Promise<string[][]> {
    return readRows(tab);
  }

  async appendRows(tab: TabName, rows: string[][]): Promise<void> {
    if (rows.length === 0) return;
    const existing = readRows(tab);
    writeRows(tab, [...existing, ...rows]);
  }

  async updateRowByColumn(
    tab: TabName,
    columnIndex: number,
    matchValue: string,
    values: string[]
  ): Promise<boolean> {
    const rows = readRows(tab);
    const idx = rows.findIndex((r) => (r[columnIndex] ?? "") === matchValue);
    if (idx === -1) return false;
    rows[idx] = values;
    writeRows(tab, rows);
    return true;
  }
}

let storeSingleton: MockSheetStore | null = null;

export function getMockStore(): SheetStore {
  if (!storeSingleton) storeSingleton = new MockSheetStore();
  return storeSingleton;
}
