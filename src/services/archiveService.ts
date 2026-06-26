// ===== 아카이브 / 복원 처리 =====
// 원본 운영 탭 행은 삭제하지 않고, 아카이브 탭에 append + 리드 status 만 변경.

import { ARCHIVABLE_STATUSES } from "@/lib/constants";
import { nowDateTimeStr, nowIso } from "@/lib/dates";
import { genId } from "@/lib/ids";
import {
  MATCH_COLUMN,
  TABS,
  archiveConsultationToRow,
  archiveFollowUpToRow,
  archiveLeadToRow,
  leadToRow,
  rowToArchiveLead,
} from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";
import type { ArchiveLead, Lead } from "@/lib/types";
import { listConsultationsByLead } from "./consultationService";
import { listFollowUpsByLead } from "./followUpService";
import { getLead, listLeads } from "./leadService";
import {
  appendChangeLog,
  appendLeadSnapshot,
  appendStageHistory,
} from "./logService";

export async function listArchiveLeads(
  store: SheetStore
): Promise<ArchiveLead[]> {
  const rows = await store.readTab(TABS.ARCHIVE_LEAD);
  return rows.map(rowToArchiveLead);
}

export async function isLeadArchived(
  store: SheetStore,
  leadId: string
): Promise<boolean> {
  const archived = await listArchiveLeads(store);
  return archived.some((a) => a.leadId === leadId);
}

// 아카이브 대상(상태 기준, 아직 아카이브 안 됨) 리드 목록
export async function listArchivableLeads(store: SheetStore): Promise<Lead[]> {
  const leads = await listLeads(store);
  return leads.filter(
    (l) => ARCHIVABLE_STATUSES.includes(l.status) && !l.archived
  );
}

export type ArchiveResult = { archived: boolean; skipped?: boolean; lead?: Lead };

// 단일 리드 아카이브 처리
export async function archiveLeadRecord(
  store: SheetStore,
  leadId: string,
  actor: string
): Promise<ArchiveResult> {
  const lead = await getLead(store, leadId);
  if (!lead) throw new Error(`리드를 찾을 수 없습니다: ${leadId}`);

  // 이미 아카이브된 leadId 는 중복 아카이브하지 않음
  if (lead.archived || (await isLeadArchived(store, leadId))) {
    return { archived: false, skipped: true, lead };
  }

  const archivedAt = nowDateTimeStr();
  const archiveId = genId("ARC");

  // 1) 아카이브_리드 append
  await store.appendRows(TABS.ARCHIVE_LEAD, [
    archiveLeadToRow(lead, { archiveId, archivedAt }),
  ]);

  // 2) 연결된 상담 -> 아카이브_상담 append
  const consultations = await listConsultationsByLead(store, leadId);
  if (consultations.length > 0) {
    await store.appendRows(
      TABS.ARCHIVE_CONSULTATION,
      consultations.map((c) =>
        archiveConsultationToRow(c, { archiveId, archivedAt })
      )
    );
  }

  // 3) 연결된 재접촉 -> 아카이브_CRM재접촉 append
  const followUps = await listFollowUpsByLead(store, leadId);
  if (followUps.length > 0) {
    await store.appendRows(
      TABS.ARCHIVE_FOLLOW_UP,
      followUps.map((f) => archiveFollowUpToRow(f, { archiveId, archivedAt }))
    );
  }

  // 4) 리드마스터 status/archived 변경 (행 삭제 X)
  const merged: Lead = {
    ...lead,
    status: "아카이브됨",
    archived: true,
    archivedAt,
    updatedBy: actor,
    updatedAt: nowIso(),
  };
  await store.updateRowByColumn(
    TABS.LEAD,
    MATCH_COLUMN[TABS.LEAD] ?? 0,
    leadId,
    leadToRow(merged)
  );

  // 5~7) 스냅샷 / 데이터변경로그 / 상태변경이력
  await appendLeadSnapshot(store, merged, "ARCHIVE", actor);
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: TABS.ARCHIVE_LEAD,
    targetId: archiveId,
    leadId,
    changeType: "ARCHIVE",
    memo: `아카이브 처리 (상담 ${consultations.length}건, 재접촉 ${followUps.length}건 포함)`,
  });
  await appendStageHistory(store, {
    leadId,
    changedBy: actor,
    previousStage: lead.currentStage,
    newStage: lead.currentStage,
    reason: "아카이브",
    memo: "아카이브 처리",
  });

  return { archived: true, lead: merged };
}

// 복원 처리
export async function restoreLeadRecord(
  store: SheetStore,
  leadId: string,
  actor: string,
  restoreStage = "상담 진행 중"
): Promise<Lead> {
  const lead = await getLead(store, leadId);
  if (!lead) throw new Error(`리드를 찾을 수 없습니다: ${leadId}`);

  const previousStage = lead.currentStage;
  const merged: Lead = {
    ...lead,
    status: "활성",
    archived: false,
    archivedAt: "",
    currentStage: restoreStage,
    updatedBy: actor,
    updatedAt: nowIso(),
  };
  await store.updateRowByColumn(
    TABS.LEAD,
    MATCH_COLUMN[TABS.LEAD] ?? 0,
    leadId,
    leadToRow(merged)
  );

  await appendLeadSnapshot(store, merged, "RESTORE", actor);
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: TABS.LEAD,
    targetId: leadId,
    leadId,
    changeType: "RESTORE",
    beforeValue: "아카이브됨",
    afterValue: "활성",
    memo: "아카이브 복원",
  });
  await appendStageHistory(store, {
    leadId,
    changedBy: actor,
    previousStage,
    newStage: restoreStage,
    reason: "복원",
    memo: "아카이브 복원",
  });
  return merged;
}

// 아카이브 대상 일괄 처리
export async function runArchiveSweep(
  store: SheetStore,
  actor: string
): Promise<{ count: number }> {
  const targets = await listArchivableLeads(store);
  let count = 0;
  for (const lead of targets) {
    const res = await archiveLeadRecord(store, lead.leadId, actor);
    if (res.archived) count += 1;
  }
  return { count };
}
