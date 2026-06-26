// ===== 구글시트 탭 정의 / 헤더 / 행 직렬화·파싱 =====
// 운영 탭은 leadId(또는 id) 기준 update 가능, 로그 탭은 append 전용.

import type {
  ArchiveLead,
  Consultation,
  DataChangeLog,
  FollowUp,
  Lead,
  LeadSnapshot,
  StageHistory,
} from "../types";

export const TABS = {
  LEAD: "리드마스터",
  CONSULTATION: "상담접수",
  FOLLOW_UP: "CRM재접촉",
  STAGE_HISTORY: "상태변경이력",
  CHANGE_LOG: "데이터변경로그",
  LEAD_SNAPSHOT: "리드스냅샷로그",
  CONSULTATION_LOG: "상담원본로그",
  FOLLOW_UP_LOG: "CRM재접촉로그",
  ARCHIVE_LEAD: "아카이브_리드",
  ARCHIVE_CONSULTATION: "아카이브_상담",
  ARCHIVE_FOLLOW_UP: "아카이브_CRM재접촉",
} as const;

export type TabName = (typeof TABS)[keyof typeof TABS];

// 탭 생성 순서 (스프레드시트 구조)
export const ALL_TABS: TabName[] = [
  TABS.LEAD,
  TABS.CONSULTATION,
  TABS.FOLLOW_UP,
  TABS.STAGE_HISTORY,
  TABS.CHANGE_LOG,
  TABS.LEAD_SNAPSHOT,
  TABS.CONSULTATION_LOG,
  TABS.FOLLOW_UP_LOG,
  TABS.ARCHIVE_LEAD,
  TABS.ARCHIVE_CONSULTATION,
  TABS.ARCHIVE_FOLLOW_UP,
];

export const HEADERS: Record<TabName, string[]> = {
  [TABS.LEAD]: [
    "리드 ID", "접수일", "상호명", "담당자명", "연락처", "업종", "지역",
    "유입 채널", "문제 유형", "현재 단계", "관리 필요도", "계약 가능성",
    "담당자", "다음 액션", "다음 연락일", "비고", "상태", "archived",
    "archivedAt", "생성자", "수정자", "수정일",
  ],
  [TABS.CONSULTATION]: [
    "상담 ID", "리드 ID", "접수일시", "상담 채널", "상호명", "담당자명",
    "연락처", "업종", "지역", "문제 유형", "고객이 말한 증상", "평수",
    "관리 필요도", "사진 요청 여부", "사진 수신 여부", "방문 진단 필요 여부",
    "상담 결과", "다음 액션", "다음 연락일", "상담 메모", "담당자",
    "생성자", "수정자", "수정일",
  ],
  [TABS.FOLLOW_UP]: [
    "재접촉 ID", "리드 ID", "상호명", "담당자명", "연락처", "문제 유형",
    "보류 발생일", "보류 사유", "재접촉 구분", "재접촉 예정일",
    "재접촉 완료 여부", "완료일", "고객 상태", "재제안 내용", "다음 액션",
    "담당자", "메모", "생성자", "수정자", "완료자", "수정일",
  ],
  [TABS.STAGE_HISTORY]: [
    "이력 ID", "리드 ID", "변경일시", "변경자 이름", "변경 전 단계",
    "변경 후 단계", "변경 사유", "변경 메모",
  ],
  [TABS.CHANGE_LOG]: [
    "로그 ID", "발생일시", "실행자 이름", "대상 탭", "대상 ID", "리드 ID",
    "변경 유형", "변경 필드", "변경 전 값", "변경 후 값", "메모",
  ],
  [TABS.LEAD_SNAPSHOT]: [
    "스냅샷 ID", "기록일시", "변경자", "변경 유형", "리드 ID", "접수일",
    "상호명", "담당자명", "연락처", "업종", "지역", "유입 채널", "문제 유형",
    "현재 단계", "관리 필요도", "계약 가능성", "담당자", "다음 액션",
    "다음 연락일", "비고", "상태", "archived", "archivedAt",
  ],
  [TABS.CONSULTATION_LOG]: [
    "로그 ID", "기록일시", "변경자", "변경 유형", "상담 ID", "리드 ID",
    "접수일시", "상담 채널", "상호명", "담당자명", "연락처", "업종", "지역",
    "문제 유형", "고객이 말한 증상", "평수", "관리 필요도", "사진 요청 여부",
    "사진 수신 여부", "방문 진단 필요 여부", "상담 결과", "다음 액션",
    "다음 연락일", "상담 메모", "담당자",
  ],
  [TABS.FOLLOW_UP_LOG]: [
    "로그 ID", "기록일시", "변경자", "변경 유형", "재접촉 ID", "리드 ID",
    "상호명", "담당자명", "연락처", "문제 유형", "보류 발생일", "보류 사유",
    "재접촉 구분", "재접촉 예정일", "재접촉 완료 여부", "완료일", "고객 상태",
    "재제안 내용", "다음 액션", "담당자", "메모",
  ],
  [TABS.ARCHIVE_LEAD]: [
    "아카이브 ID", "아카이브 일시", "리드 ID", "접수일", "상호명", "담당자명",
    "연락처", "업종", "지역", "유입 채널", "문제 유형", "현재 단계",
    "관리 필요도", "계약 가능성", "담당자", "다음 액션", "다음 연락일",
    "비고", "상태",
  ],
  [TABS.ARCHIVE_CONSULTATION]: [
    "아카이브 ID", "아카이브 일시", "상담 ID", "리드 ID", "접수일시",
    "상담 채널", "상호명", "담당자명", "연락처", "업종", "지역", "문제 유형",
    "고객이 말한 증상", "평수", "관리 필요도", "사진 요청 여부",
    "사진 수신 여부", "방문 진단 필요 여부", "상담 결과", "다음 액션",
    "다음 연락일", "상담 메모", "담당자",
  ],
  [TABS.ARCHIVE_FOLLOW_UP]: [
    "아카이브 ID", "아카이브 일시", "재접촉 ID", "리드 ID", "상호명",
    "담당자명", "연락처", "문제 유형", "보류 발생일", "보류 사유",
    "재접촉 구분", "재접촉 예정일", "재접촉 완료 여부", "완료일", "고객 상태",
    "재제안 내용", "다음 액션", "담당자", "메모",
  ],
};

// ===== boolean 직렬화/파싱 헬퍼 =====
export function boolStr(v: boolean): string {
  return v ? "예" : "아니오";
}
export function parseBool(v: string | undefined): boolean {
  if (!v) return false;
  const t = v.trim().toLowerCase();
  return t === "예" || t === "true" || t === "1" || t === "y";
}
function cell(row: string[], i: number): string {
  return row[i] ?? "";
}

// ===== 직렬화 (객체 -> 행) =====

export function leadToRow(l: Lead): string[] {
  return [
    l.leadId, l.receivedDate, l.storeName, l.contactName, l.phone, l.industry,
    l.region, l.sourceChannel, l.issueType, l.currentStage, l.managementNeed,
    l.contractPossibility, l.owner, l.nextAction, l.nextContactDate, l.note,
    l.status, boolStr(l.archived), l.archivedAt ?? "", l.createdBy,
    l.updatedBy, l.updatedAt,
  ];
}

export function consultationToRow(c: Consultation): string[] {
  return [
    c.id, c.leadId, c.consultationDateTime, c.channel, c.storeName,
    c.contactName, c.phone, c.industry, c.region, c.issueType, c.symptomText,
    c.storeSize, c.managementNeed, boolStr(c.photoRequested),
    boolStr(c.photoReceived), c.visitDiagnosisNeeded, c.consultationResult,
    c.nextAction, c.nextContactDate, c.memo, c.owner, c.createdBy,
    c.updatedBy, c.updatedAt,
  ];
}

export function followUpToRow(f: FollowUp): string[] {
  return [
    f.id, f.leadId, f.storeName, f.contactName, f.phone, f.issueType,
    f.holdDate, f.holdReason, f.followUpType, f.scheduledDate,
    boolStr(f.completed), f.completedDate ?? "", f.customerStatus,
    f.proposalMessage, f.nextAction, f.owner, f.memo, f.createdBy,
    f.updatedBy, f.completedBy ?? "", f.updatedAt,
  ];
}

export function stageHistoryToRow(s: StageHistory): string[] {
  return [
    s.id, s.leadId, s.createdAt, s.changedBy, s.previousStage, s.newStage,
    s.reason, s.memo,
  ];
}

export function changeLogToRow(d: DataChangeLog): string[] {
  return [
    d.id, d.createdAt, d.actorName, d.targetSheet, d.targetId, d.leadId ?? "",
    d.changeType, d.changedField ?? "", d.beforeValue ?? "",
    d.afterValue ?? "", d.memo,
  ];
}

export function leadSnapshotToRow(s: LeadSnapshot): string[] {
  return [
    s.id, s.createdAt, s.changedBy, s.changeType, s.leadId, s.receivedDate,
    s.storeName, s.contactName, s.phone, s.industry, s.region, s.sourceChannel,
    s.issueType, s.currentStage, s.managementNeed, s.contractPossibility,
    s.owner, s.nextAction, s.nextContactDate, s.note, s.status,
    boolStr(s.archived), s.archivedAt ?? "",
  ];
}

// 상담원본로그 행 (Consultation + 로그 메타)
export function consultationLogToRow(
  c: Consultation,
  meta: { logId: string; recordedAt: string; changedBy: string; changeType: string }
): string[] {
  return [
    meta.logId, meta.recordedAt, meta.changedBy, meta.changeType, c.id,
    c.leadId, c.consultationDateTime, c.channel, c.storeName, c.contactName,
    c.phone, c.industry, c.region, c.issueType, c.symptomText, c.storeSize,
    c.managementNeed, boolStr(c.photoRequested), boolStr(c.photoReceived),
    c.visitDiagnosisNeeded, c.consultationResult, c.nextAction,
    c.nextContactDate, c.memo, c.owner,
  ];
}

// CRM재접촉로그 행 (FollowUp + 로그 메타)
export function followUpLogToRow(
  f: FollowUp,
  meta: { logId: string; recordedAt: string; changedBy: string; changeType: string }
): string[] {
  return [
    meta.logId, meta.recordedAt, meta.changedBy, meta.changeType, f.id,
    f.leadId, f.storeName, f.contactName, f.phone, f.issueType, f.holdDate,
    f.holdReason, f.followUpType, f.scheduledDate, boolStr(f.completed),
    f.completedDate ?? "", f.customerStatus, f.proposalMessage, f.nextAction,
    f.owner, f.memo,
  ];
}

export function archiveLeadToRow(l: Lead, meta: { archiveId: string; archivedAt: string }): string[] {
  return [
    meta.archiveId, meta.archivedAt, l.leadId, l.receivedDate, l.storeName,
    l.contactName, l.phone, l.industry, l.region, l.sourceChannel,
    l.issueType, l.currentStage, l.managementNeed, l.contractPossibility,
    l.owner, l.nextAction, l.nextContactDate, l.note, l.status,
  ];
}

export function archiveConsultationToRow(
  c: Consultation,
  meta: { archiveId: string; archivedAt: string }
): string[] {
  return [
    meta.archiveId, meta.archivedAt, c.id, c.leadId, c.consultationDateTime,
    c.channel, c.storeName, c.contactName, c.phone, c.industry, c.region,
    c.issueType, c.symptomText, c.storeSize, c.managementNeed,
    boolStr(c.photoRequested), boolStr(c.photoReceived),
    c.visitDiagnosisNeeded, c.consultationResult, c.nextAction,
    c.nextContactDate, c.memo, c.owner,
  ];
}

export function archiveFollowUpToRow(
  f: FollowUp,
  meta: { archiveId: string; archivedAt: string }
): string[] {
  return [
    meta.archiveId, meta.archivedAt, f.id, f.leadId, f.storeName,
    f.contactName, f.phone, f.issueType, f.holdDate, f.holdReason,
    f.followUpType, f.scheduledDate, boolStr(f.completed),
    f.completedDate ?? "", f.customerStatus, f.proposalMessage, f.nextAction,
    f.owner, f.memo,
  ];
}

// ===== 파싱 (행 -> 객체) =====

export function rowToLead(row: string[]): Lead {
  const leadId = cell(row, 0);
  return {
    id: leadId,
    leadId,
    createdAt: cell(row, 1),
    receivedDate: cell(row, 1),
    storeName: cell(row, 2),
    contactName: cell(row, 3),
    phone: cell(row, 4),
    industry: cell(row, 5),
    region: cell(row, 6),
    sourceChannel: cell(row, 7),
    issueType: cell(row, 8),
    currentStage: cell(row, 9),
    managementNeed: (cell(row, 10) || "중간") as Lead["managementNeed"],
    contractPossibility: (cell(row, 11) || "중간") as Lead["contractPossibility"],
    owner: cell(row, 12),
    nextAction: cell(row, 13),
    nextContactDate: cell(row, 14),
    note: cell(row, 15),
    status: (cell(row, 16) || "활성") as Lead["status"],
    archived: parseBool(cell(row, 17)),
    archivedAt: cell(row, 18) || undefined,
    createdBy: cell(row, 19),
    updatedBy: cell(row, 20),
    updatedAt: cell(row, 21),
  };
}

export function rowToConsultation(row: string[]): Consultation {
  return {
    id: cell(row, 0),
    leadId: cell(row, 1),
    createdAt: cell(row, 2),
    consultationDateTime: cell(row, 2),
    channel: cell(row, 3),
    storeName: cell(row, 4),
    contactName: cell(row, 5),
    phone: cell(row, 6),
    industry: cell(row, 7),
    region: cell(row, 8),
    issueType: cell(row, 9),
    symptomText: cell(row, 10),
    storeSize: cell(row, 11),
    managementNeed: (cell(row, 12) || "중간") as Consultation["managementNeed"],
    photoRequested: parseBool(cell(row, 13)),
    photoReceived: parseBool(cell(row, 14)),
    visitDiagnosisNeeded: (cell(row, 15) || "판단 보류") as Consultation["visitDiagnosisNeeded"],
    consultationResult: cell(row, 16),
    nextAction: cell(row, 17),
    nextContactDate: cell(row, 18),
    memo: cell(row, 19),
    owner: cell(row, 20),
    createdBy: cell(row, 21),
    updatedBy: cell(row, 22),
    updatedAt: cell(row, 23),
  };
}

export function rowToFollowUp(row: string[]): FollowUp {
  return {
    id: cell(row, 0),
    leadId: cell(row, 1),
    storeName: cell(row, 2),
    contactName: cell(row, 3),
    phone: cell(row, 4),
    issueType: cell(row, 5),
    holdDate: cell(row, 6),
    holdReason: cell(row, 7),
    followUpType: (cell(row, 8) || "3일 후") as FollowUp["followUpType"],
    scheduledDate: cell(row, 9),
    completed: parseBool(cell(row, 10)),
    completedDate: cell(row, 11) || undefined,
    customerStatus: cell(row, 12),
    proposalMessage: cell(row, 13),
    nextAction: cell(row, 14),
    owner: cell(row, 15),
    memo: cell(row, 16),
    createdBy: cell(row, 17),
    updatedBy: cell(row, 18),
    completedBy: cell(row, 19) || undefined,
    updatedAt: cell(row, 20),
  };
}

export function rowToStageHistory(row: string[]): StageHistory {
  return {
    id: cell(row, 0),
    leadId: cell(row, 1),
    createdAt: cell(row, 2),
    changedBy: cell(row, 3),
    previousStage: cell(row, 4),
    newStage: cell(row, 5),
    reason: cell(row, 6),
    memo: cell(row, 7),
  };
}

export function rowToChangeLog(row: string[]): DataChangeLog {
  return {
    id: cell(row, 0),
    createdAt: cell(row, 1),
    actorName: cell(row, 2),
    targetSheet: cell(row, 3),
    targetId: cell(row, 4),
    leadId: cell(row, 5) || undefined,
    changeType: (cell(row, 6) || "UPDATE") as DataChangeLog["changeType"],
    changedField: cell(row, 7) || undefined,
    beforeValue: cell(row, 8) || undefined,
    afterValue: cell(row, 9) || undefined,
    memo: cell(row, 10),
  };
}

export function rowToLeadSnapshot(row: string[]): LeadSnapshot {
  return {
    id: cell(row, 0),
    createdAt: cell(row, 1),
    changedBy: cell(row, 2),
    changeType: cell(row, 3),
    leadId: cell(row, 4),
    receivedDate: cell(row, 5),
    storeName: cell(row, 6),
    contactName: cell(row, 7),
    phone: cell(row, 8),
    industry: cell(row, 9),
    region: cell(row, 10),
    sourceChannel: cell(row, 11),
    issueType: cell(row, 12),
    currentStage: cell(row, 13),
    managementNeed: cell(row, 14),
    contractPossibility: cell(row, 15),
    owner: cell(row, 16),
    nextAction: cell(row, 17),
    nextContactDate: cell(row, 18),
    note: cell(row, 19),
    status: cell(row, 20),
    archived: parseBool(cell(row, 21)),
    archivedAt: cell(row, 22) || undefined,
  };
}

export function rowToArchiveLead(row: string[]): ArchiveLead {
  return {
    archiveId: cell(row, 0),
    archivedAt: cell(row, 1),
    leadId: cell(row, 2),
    receivedDate: cell(row, 3),
    storeName: cell(row, 4),
    contactName: cell(row, 5),
    phone: cell(row, 6),
    industry: cell(row, 7),
    region: cell(row, 8),
    sourceChannel: cell(row, 9),
    issueType: cell(row, 10),
    currentStage: cell(row, 11),
    managementNeed: cell(row, 12),
    contractPossibility: cell(row, 13),
    owner: cell(row, 14),
    nextAction: cell(row, 15),
    nextContactDate: cell(row, 16),
    note: cell(row, 17),
    status: cell(row, 18),
  };
}

// 운영 탭에서 update 시 매칭 컬럼 (0-based index)
export const MATCH_COLUMN: Partial<Record<TabName, number>> = {
  [TABS.LEAD]: 0, // 리드 ID
  [TABS.CONSULTATION]: 0, // 상담 ID
  [TABS.FOLLOW_UP]: 0, // 재접촉 ID
};
