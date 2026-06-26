// ===== 이력/로그 조회 (상태변경이력, 리드스냅샷, 데이터변경로그) =====

import {
  TABS,
  rowToChangeLog,
  rowToLeadSnapshot,
  rowToStageHistory,
} from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";
import type { DataChangeLog, LeadSnapshot, StageHistory } from "@/lib/types";

export async function listStageHistory(
  store: SheetStore
): Promise<StageHistory[]> {
  const rows = await store.readTab(TABS.STAGE_HISTORY);
  return rows.map(rowToStageHistory);
}

export async function listStageHistoryByLead(
  store: SheetStore,
  leadId: string
): Promise<StageHistory[]> {
  const all = await listStageHistory(store);
  return all.filter((s) => s.leadId === leadId);
}

export async function listSnapshots(
  store: SheetStore
): Promise<LeadSnapshot[]> {
  const rows = await store.readTab(TABS.LEAD_SNAPSHOT);
  return rows.map(rowToLeadSnapshot);
}

export async function listSnapshotsByLead(
  store: SheetStore,
  leadId: string
): Promise<LeadSnapshot[]> {
  const all = await listSnapshots(store);
  return all.filter((s) => s.leadId === leadId);
}

export async function listChangeLog(
  store: SheetStore
): Promise<DataChangeLog[]> {
  const rows = await store.readTab(TABS.CHANGE_LOG);
  return rows.map(rowToChangeLog);
}
