// ===== 로그 탭 기록 (append 전용) =====
// 모든 로그 탭은 절대 update 하지 않고 append 만 한다.

import { nowDateTimeStr } from "@/lib/dates";
import { genId } from "@/lib/ids";
import {
  changeLogToRow,
  consultationLogToRow,
  followUpLogToRow,
  leadSnapshotToRow,
  stageHistoryToRow,
  TABS,
} from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";
import type {
  ChangeType,
  Consultation,
  DataChangeLog,
  FollowUp,
  Lead,
} from "@/lib/types";

// 데이터변경로그 append
export async function appendChangeLog(
  store: SheetStore,
  entry: {
    actorName: string;
    targetSheet: string;
    targetId: string;
    leadId?: string;
    changeType: ChangeType;
    changedField?: string;
    beforeValue?: string;
    afterValue?: string;
    memo: string;
  }
): Promise<void> {
  const log: DataChangeLog = {
    id: genId("LOG"),
    createdAt: nowDateTimeStr(),
    ...entry,
  };
  await store.appendRows(TABS.CHANGE_LOG, [changeLogToRow(log)]);
}

// 상태변경이력 append
export async function appendStageHistory(
  store: SheetStore,
  entry: {
    leadId: string;
    changedBy: string;
    previousStage: string;
    newStage: string;
    reason: string;
    memo: string;
  }
): Promise<void> {
  await store.appendRows(TABS.STAGE_HISTORY, [
    stageHistoryToRow({
      id: genId("SH"),
      createdAt: nowDateTimeStr(),
      ...entry,
    }),
  ]);
}

// 리드스냅샷로그 append (수정 후 전체 값)
export async function appendLeadSnapshot(
  store: SheetStore,
  lead: Lead,
  changeType: string,
  changedBy: string
): Promise<void> {
  await store.appendRows(TABS.LEAD_SNAPSHOT, [
    leadSnapshotToRow({
      id: genId("SNAP"),
      createdAt: nowDateTimeStr(),
      changedBy,
      changeType,
      leadId: lead.leadId,
      receivedDate: lead.receivedDate,
      storeName: lead.storeName,
      contactName: lead.contactName,
      phone: lead.phone,
      industry: lead.industry,
      region: lead.region,
      sourceChannel: lead.sourceChannel,
      issueType: lead.issueType,
      currentStage: lead.currentStage,
      managementNeed: lead.managementNeed,
      contractPossibility: lead.contractPossibility,
      owner: lead.owner,
      nextAction: lead.nextAction,
      nextContactDate: lead.nextContactDate,
      note: lead.note,
      status: lead.status,
      archived: lead.archived,
      archivedAt: lead.archivedAt,
    }),
  ]);
}

// 상담원본로그 append
export async function appendConsultationLog(
  store: SheetStore,
  consultation: Consultation,
  changeType: string,
  changedBy: string
): Promise<void> {
  await store.appendRows(TABS.CONSULTATION_LOG, [
    consultationLogToRow(consultation, {
      logId: genId("CLOG"),
      recordedAt: nowDateTimeStr(),
      changedBy,
      changeType,
    }),
  ]);
}

// CRM재접촉로그 append
export async function appendFollowUpLog(
  store: SheetStore,
  followUp: FollowUp,
  changeType: string,
  changedBy: string
): Promise<void> {
  await store.appendRows(TABS.FOLLOW_UP_LOG, [
    followUpLogToRow(followUp, {
      logId: genId("FLOG"),
      recordedAt: nowDateTimeStr(),
      changedBy,
      changeType,
    }),
  ]);
}
