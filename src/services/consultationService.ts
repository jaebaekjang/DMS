// ===== 상담 접수 단일 엔티티 처리 =====
// 상담접수 탭 append/update + 상담원본로그 append.

import { nowIso } from "@/lib/dates";
import {
  MATCH_COLUMN,
  TABS,
  consultationToRow,
  rowToConsultation,
} from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";
import type { Consultation } from "@/lib/types";
import { appendChangeLog, appendConsultationLog } from "./logService";

export async function listConsultations(
  store: SheetStore
): Promise<Consultation[]> {
  const rows = await store.readTab(TABS.CONSULTATION);
  return rows.map(rowToConsultation);
}

export async function listConsultationsByLead(
  store: SheetStore,
  leadId: string
): Promise<Consultation[]> {
  const all = await listConsultations(store);
  return all.filter((c) => c.leadId === leadId);
}

// 신규 상담 기록 생성: 상담접수 append + 상담원본로그 append
export async function createConsultationRecord(
  store: SheetStore,
  consultation: Consultation,
  actor: string,
  changeType: "CREATE" | "CREATE_CONSULTATION" = "CREATE"
): Promise<Consultation> {
  await store.appendRows(TABS.CONSULTATION, [consultationToRow(consultation)]);
  await appendConsultationLog(store, consultation, changeType, actor);
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: TABS.CONSULTATION,
    targetId: consultation.id,
    leadId: consultation.leadId,
    changeType,
    memo: "상담 접수 등록",
  });
  return consultation;
}

// 상담 수정: 상담접수 update + 상담원본로그 append(UPDATE)
export async function updateConsultationRecord(
  store: SheetStore,
  id: string,
  updates: Partial<Consultation>,
  actor: string
): Promise<Consultation> {
  const all = await listConsultations(store);
  const existing = all.find((c) => c.id === id);
  if (!existing) throw new Error(`상담을 찾을 수 없습니다: ${id}`);

  const merged: Consultation = {
    ...existing,
    ...updates,
    id: existing.id,
    leadId: existing.leadId,
    updatedBy: actor,
    updatedAt: nowIso(),
  };

  const ok = await store.updateRowByColumn(
    TABS.CONSULTATION,
    MATCH_COLUMN[TABS.CONSULTATION] ?? 0,
    id,
    consultationToRow(merged)
  );
  if (!ok) throw new Error(`상담 행 업데이트 실패: ${id}`);

  await appendConsultationLog(store, merged, "UPDATE", actor);
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: TABS.CONSULTATION,
    targetId: id,
    leadId: merged.leadId,
    changeType: "UPDATE",
    memo: "상담 수정",
  });
  return merged;
}
