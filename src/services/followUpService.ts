// ===== CRM 재접촉 단일 엔티티 처리 =====
// CRM재접촉 탭 append/update + CRM재접촉로그 append.

import { nowIso } from "@/lib/dates";
import {
  MATCH_COLUMN,
  TABS,
  followUpToRow,
  rowToFollowUp,
} from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";
import type { FollowUp } from "@/lib/types";
import { appendChangeLog, appendFollowUpLog } from "./logService";

export async function listFollowUps(store: SheetStore): Promise<FollowUp[]> {
  const rows = await store.readTab(TABS.FOLLOW_UP);
  return rows.map(rowToFollowUp);
}

export async function listFollowUpsByLead(
  store: SheetStore,
  leadId: string
): Promise<FollowUp[]> {
  const all = await listFollowUps(store);
  return all.filter((f) => f.leadId === leadId);
}

// 같은 leadId 로 미완료 재접촉이 이미 있는지 (중복 생성 방지)
export async function hasOpenFollowUp(
  store: SheetStore,
  leadId: string
): Promise<boolean> {
  const all = await listFollowUps(store);
  return all.some((f) => f.leadId === leadId && !f.completed);
}

// 재접촉 생성: CRM재접촉 append + CRM재접촉로그 append + 데이터변경로그 append
export async function createFollowUpRecord(
  store: SheetStore,
  followUp: FollowUp,
  actor: string
): Promise<FollowUp> {
  await store.appendRows(TABS.FOLLOW_UP, [followUpToRow(followUp)]);
  await appendFollowUpLog(store, followUp, "FOLLOW_UP_CREATE", actor);
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: TABS.FOLLOW_UP,
    targetId: followUp.id,
    leadId: followUp.leadId,
    changeType: "FOLLOW_UP_CREATE",
    memo: `재접촉 생성 (${followUp.followUpType})`,
  });
  return followUp;
}

// 재접촉 수정/완료: CRM재접촉 update + CRM재접촉로그 append
export async function updateFollowUpRecord(
  store: SheetStore,
  id: string,
  updates: Partial<FollowUp>,
  actor: string,
  changeType: "UPDATE" | "FOLLOW_UP_COMPLETE" = "UPDATE"
): Promise<FollowUp> {
  const all = await listFollowUps(store);
  const existing = all.find((f) => f.id === id);
  if (!existing) throw new Error(`재접촉을 찾을 수 없습니다: ${id}`);

  const merged: FollowUp = {
    ...existing,
    ...updates,
    id: existing.id,
    leadId: existing.leadId,
    updatedBy: actor,
    updatedAt: nowIso(),
  };

  const ok = await store.updateRowByColumn(
    TABS.FOLLOW_UP,
    MATCH_COLUMN[TABS.FOLLOW_UP] ?? 0,
    id,
    followUpToRow(merged)
  );
  if (!ok) throw new Error(`재접촉 행 업데이트 실패: ${id}`);

  await appendFollowUpLog(
    store,
    merged,
    changeType === "FOLLOW_UP_COMPLETE" ? "FOLLOW_UP_COMPLETE" : "UPDATE",
    actor
  );
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: TABS.FOLLOW_UP,
    targetId: id,
    leadId: merged.leadId,
    changeType,
    memo:
      changeType === "FOLLOW_UP_COMPLETE" ? "재접촉 완료 처리" : "재접촉 수정",
  });
  return merged;
}
