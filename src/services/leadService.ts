// ===== 리드(고객) 단일 엔티티 처리 =====
// 운영 탭(리드마스터) update + 관련 로그 append. 교차 엔티티 자동화는 crmService 에서 담당.

import { STAGE_TO_STATUS } from "@/lib/constants";
import { nowIso } from "@/lib/dates";
import {
  MATCH_COLUMN,
  TABS,
  leadToRow,
  rowToLead,
} from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";
import type { Lead, LeadStatus } from "@/lib/types";
import {
  appendChangeLog,
  appendLeadSnapshot,
  appendStageHistory,
} from "./logService";

export async function listLeads(store: SheetStore): Promise<Lead[]> {
  const rows = await store.readTab(TABS.LEAD);
  return rows.map(rowToLead);
}

export async function getLead(
  store: SheetStore,
  leadId: string
): Promise<Lead | null> {
  const leads = await listLeads(store);
  return leads.find((l) => l.leadId === leadId) ?? null;
}

// 신규 리드 생성 (상담 접수 흐름에서 호출)
// 리드마스터 append + 스냅샷 + 상태변경이력(최초) + 데이터변경로그 CREATE
export async function createLeadRecord(
  store: SheetStore,
  lead: Lead,
  actor: string
): Promise<Lead> {
  await store.appendRows(TABS.LEAD, [leadToRow(lead)]);
  await appendLeadSnapshot(store, lead, "CREATE", actor);
  await appendStageHistory(store, {
    leadId: lead.leadId,
    changedBy: actor,
    previousStage: "",
    newStage: lead.currentStage,
    reason: "최초 생성",
    memo: "리드 생성",
  });
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: TABS.LEAD,
    targetId: lead.leadId,
    leadId: lead.leadId,
    changeType: "CREATE",
    memo: "신규 리드 생성",
  });
  return lead;
}

export type LeadUpdateResult = {
  lead: Lead;
  stageChanged: boolean;
  previousStage: string;
  newStage: string;
};

const TRACKED_FIELDS: (keyof Lead)[] = [
  "currentStage",
  "managementNeed",
  "contractPossibility",
  "owner",
  "nextAction",
  "nextContactDate",
  "note",
  "status",
];

// 리드 수정
// 1) 리드마스터 update  2) 스냅샷 append  3) 데이터변경로그 append  4) 단계 변경 시 상태변경이력 append
export async function updateLeadRecord(
  store: SheetStore,
  leadId: string,
  updates: Partial<Lead>,
  actor: string,
  opts?: { reason?: string; memo?: string }
): Promise<LeadUpdateResult> {
  const existing = await getLead(store, leadId);
  if (!existing) {
    throw new Error(`리드를 찾을 수 없습니다: ${leadId}`);
  }

  const previousStage = existing.currentStage;
  const merged: Lead = {
    ...existing,
    ...updates,
    leadId: existing.leadId,
    id: existing.leadId,
    updatedBy: actor,
    updatedAt: nowIso(),
  };

  const stageChanged =
    updates.currentStage !== undefined && updates.currentStage !== previousStage;

  // 단계 변경 시 상태 자동 동기화 (사람이 status 를 직접 지정하지 않은 경우)
  if (stageChanged && updates.status === undefined) {
    const mappedStatus = STAGE_TO_STATUS[merged.currentStage];
    if (mappedStatus) merged.status = mappedStatus;
    else if (existing.status !== "아카이브됨") merged.status = "활성";
  }

  const ok = await store.updateRowByColumn(
    TABS.LEAD,
    MATCH_COLUMN[TABS.LEAD] ?? 0,
    leadId,
    leadToRow(merged)
  );
  if (!ok) throw new Error(`리드 행 업데이트 실패: ${leadId}`);

  // 변경된 필드 요약
  const changedFields = TRACKED_FIELDS.filter(
    (f) => updates[f] !== undefined && (existing[f] ?? "") !== (merged[f] ?? "")
  );

  await appendLeadSnapshot(
    store,
    merged,
    stageChanged ? "STAGE_CHANGE" : "UPDATE",
    actor
  );

  if (changedFields.length > 0 || !stageChanged) {
    await appendChangeLog(store, {
      actorName: actor,
      targetSheet: TABS.LEAD,
      targetId: leadId,
      leadId,
      changeType: "UPDATE",
      changedField: changedFields.join(", "),
      memo: opts?.memo ?? "리드 수정",
    });
  }

  if (stageChanged) {
    await appendStageHistory(store, {
      leadId,
      changedBy: actor,
      previousStage,
      newStage: merged.currentStage,
      reason: opts?.reason ?? "단계 변경",
      memo: opts?.memo ?? "",
    });
    await appendChangeLog(store, {
      actorName: actor,
      targetSheet: TABS.LEAD,
      targetId: leadId,
      leadId,
      changeType: "STAGE_CHANGE",
      changedField: "현재 단계",
      beforeValue: previousStage,
      afterValue: merged.currentStage,
      memo: opts?.reason ?? "단계 변경",
    });
  }

  return {
    lead: merged,
    stageChanged,
    previousStage,
    newStage: merged.currentStage,
  };
}

// 리드 상태만 변경하는 소프트 삭제/비활성 처리 헬퍼
export async function softDeleteLead(
  store: SheetStore,
  leadId: string,
  status: LeadStatus,
  actor: string
): Promise<LeadUpdateResult> {
  const result = await updateLeadRecord(
    store,
    leadId,
    { status },
    actor,
    { memo: `상태 변경: ${status}` }
  );
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: TABS.LEAD,
    targetId: leadId,
    leadId,
    changeType: "SOFT_DELETE",
    afterValue: status,
    memo: `소프트 삭제/비활성 처리 (${status})`,
  });
  return result;
}
