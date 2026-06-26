// ===== CRM 오케스트레이션 (교차 엔티티 흐름) =====
// 상담 접수 -> 리드 자동 생성, 보류 -> 재접촉 자동 등록, 재접촉 완료 -> 단계 자동 변경 등.
// 단일 엔티티 처리는 각 service 가, 여러 탭에 걸친 흐름은 이 파일이 담당한다.
// (모든 매핑은 AI 판단이 아니라 사람이 선택한 값에 따른 단순 매핑이다.)

import {
  CONSULTATION_RESULT_TO_STAGE,
  CUSTOMER_STATUS_TO_STAGE,
  FOLLOW_UP_DAYS,
  NEXT_FOLLOW_UP_TYPE,
  STAGE_TO_STATUS,
} from "@/lib/constants";
import { addDays, nowDateTimeStr, nowIso, todayStr } from "@/lib/dates";
import { genId, genLeadId } from "@/lib/ids";
import { ALL_TABS, HEADERS, type TabName } from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";
import type {
  Consultation,
  FollowUp,
  Lead,
  LeadStatus,
  ManagementNeed,
  VisitDiagnosisNeeded,
} from "@/lib/types";
import {
  createConsultationRecord,
  listConsultations,
} from "./consultationService";
import {
  createFollowUpRecord,
  hasOpenFollowUp,
  updateFollowUpRecord,
} from "./followUpService";
import {
  createLeadRecord,
  getLead,
  listLeads,
  updateLeadRecord,
} from "./leadService";
import { appendChangeLog } from "./logService";

// ===== 입력 DTO =====
export type ConsultationInput = {
  consultationDateTime?: string;
  channel: string;
  storeName: string;
  contactName: string;
  phone: string;
  industry: string;
  region: string;
  issueType: string;
  symptomText: string;
  storeSize: string;
  managementNeed: ManagementNeed;
  photoRequested: boolean;
  photoReceived: boolean;
  visitDiagnosisNeeded: VisitDiagnosisNeeded;
  consultationResult: string;
  nextAction: string;
  nextContactDate: string;
  memo: string;
  owner: string;
};

export type FollowUpInput = {
  leadId: string;
  storeName: string;
  contactName: string;
  phone: string;
  issueType: string;
  holdReason: string;
  followUpType: FollowUp["followUpType"];
  scheduledDate?: string;
  owner: string;
  memo?: string;
};

export type FollowUpCompletion = {
  customerStatus: string;
  proposalMessage: string;
  nextAction: string;
  memo: string;
  completedDate?: string;
};

function stageToStatus(stage: string): LeadStatus {
  return STAGE_TO_STATUS[stage] ?? "활성";
}

// ===== 상담 접수 흐름 =====
export type CreateConsultationOptions = {
  // 'new': 신규 리드 생성 / 'attach': 기존 리드에 상담 이력 추가
  mode?: "new" | "attach";
  existingLeadId?: string;
};

export type CreateConsultationResult = {
  consultation: Consultation;
  lead: Lead;
  followUpCreated: boolean;
  mode: "new" | "attach";
};

export async function createConsultationFlow(
  store: SheetStore,
  input: ConsultationInput,
  actor: string,
  opts: CreateConsultationOptions = {}
): Promise<CreateConsultationResult> {
  const mode = opts.mode ?? "new";
  const createdAt = nowIso();
  const consultationDateTime = input.consultationDateTime || nowDateTimeStr();

  // 기존 리드에 상담 이력만 추가
  if (mode === "attach" && opts.existingLeadId) {
    const lead = await getLead(store, opts.existingLeadId);
    if (!lead) throw new Error(`기존 리드를 찾을 수 없습니다: ${opts.existingLeadId}`);

    const consultation: Consultation = buildConsultation(
      input,
      lead.leadId,
      consultationDateTime,
      createdAt,
      actor
    );
    await createConsultationRecord(store, consultation, actor, "CREATE_CONSULTATION");
    return { consultation, lead, followUpCreated: false, mode };
  }

  // 신규 리드 생성
  const leads = await listLeads(store);
  const leadId = genLeadId(leads.map((l) => l.leadId));
  const stage = CONSULTATION_RESULT_TO_STAGE[input.consultationResult] ?? "신규 문의";

  const consultation = buildConsultation(
    input,
    leadId,
    consultationDateTime,
    createdAt,
    actor
  );

  const lead: Lead = {
    id: leadId,
    leadId,
    createdAt,
    receivedDate: todayStr(),
    storeName: input.storeName,
    contactName: input.contactName,
    phone: input.phone,
    industry: input.industry,
    region: input.region,
    sourceChannel: input.channel,
    issueType: input.issueType,
    currentStage: stage,
    managementNeed: input.managementNeed,
    contractPossibility: "중간",
    owner: input.owner,
    nextAction: input.nextAction,
    nextContactDate: input.nextContactDate,
    note: "",
    status: stageToStatus(stage),
    archived: false,
    createdBy: actor,
    updatedBy: actor,
    updatedAt: createdAt,
  };

  // 상담접수/상담원본로그 + 리드마스터/스냅샷/상태변경이력/데이터변경로그
  await createConsultationRecord(store, consultation, actor, "CREATE");
  await createLeadRecord(store, lead, actor);

  // 상담 결과가 보류면 CRM재접촉 자동 등록
  let followUpCreated = false;
  if (stage === "보류") {
    followUpCreated = await autoCreateHoldFollowUp(
      store,
      lead,
      input.consultationResult || "보류",
      actor
    );
  }

  return { consultation, lead, followUpCreated, mode };
}

function buildConsultation(
  input: ConsultationInput,
  leadId: string,
  consultationDateTime: string,
  createdAt: string,
  actor: string
): Consultation {
  return {
    id: genId("CONS"),
    leadId,
    createdAt,
    consultationDateTime,
    channel: input.channel,
    storeName: input.storeName,
    contactName: input.contactName,
    phone: input.phone,
    industry: input.industry,
    region: input.region,
    issueType: input.issueType,
    symptomText: input.symptomText,
    storeSize: input.storeSize,
    managementNeed: input.managementNeed,
    photoRequested: input.photoRequested,
    photoReceived: input.photoReceived,
    visitDiagnosisNeeded: input.visitDiagnosisNeeded,
    consultationResult: input.consultationResult,
    nextAction: input.nextAction,
    nextContactDate: input.nextContactDate,
    memo: input.memo,
    owner: input.owner,
    createdBy: actor,
    updatedBy: actor,
    updatedAt: createdAt,
  };
}

// 보류 리드 -> CRM재접촉 자동 등록 (이미 미완료 재접촉이 있으면 생성 안 함)
async function autoCreateHoldFollowUp(
  store: SheetStore,
  lead: Lead,
  holdReason: string,
  actor: string
): Promise<boolean> {
  if (await hasOpenFollowUp(store, lead.leadId)) return false;
  const followUp: FollowUp = {
    id: genId("FU"),
    leadId: lead.leadId,
    storeName: lead.storeName,
    contactName: lead.contactName,
    phone: lead.phone,
    issueType: lead.issueType,
    holdDate: todayStr(),
    holdReason,
    followUpType: "3일 후",
    scheduledDate: addDays(3),
    completed: false,
    customerStatus: "관심 유지",
    proposalMessage: "",
    nextAction: "재접촉 통화",
    owner: lead.owner,
    memo: "",
    createdBy: actor,
    updatedBy: actor,
    updatedAt: nowIso(),
  };
  await createFollowUpRecord(store, followUp, actor);
  return true;
}

// ===== 리드 수정 흐름 (보류 -> 재접촉 자동 등록 포함) =====
export type UpdateLeadResult = {
  lead: Lead;
  stageChanged: boolean;
  followUpCreated: boolean;
  duplicateHoldWarning: boolean;
};

export async function updateLeadFlow(
  store: SheetStore,
  leadId: string,
  updates: Partial<Lead>,
  actor: string,
  opts?: { holdReason?: string; reason?: string }
): Promise<UpdateLeadResult> {
  const result = await updateLeadRecord(store, leadId, updates, actor, {
    reason: opts?.reason,
  });

  let followUpCreated = false;
  let duplicateHoldWarning = false;

  // 단계를 "보류"로 변경하면 CRM재접촉 자동 등록
  if (result.stageChanged && result.newStage === "보류") {
    if (await hasOpenFollowUp(store, leadId)) {
      duplicateHoldWarning = true;
    } else {
      followUpCreated = await autoCreateHoldFollowUp(
        store,
        result.lead,
        opts?.holdReason || "내부 검토",
        actor
      );
    }
  }

  return {
    lead: result.lead,
    stageChanged: result.stageChanged,
    followUpCreated,
    duplicateHoldWarning,
  };
}

// ===== CRM 재접촉 수동 생성 =====
export async function createFollowUpFlow(
  store: SheetStore,
  input: FollowUpInput,
  actor: string
): Promise<{ followUp: FollowUp; duplicateWarning: boolean }> {
  if (await hasOpenFollowUp(store, input.leadId)) {
    return { followUp: buildFollowUp(input, actor), duplicateWarning: true };
  }
  const followUp = buildFollowUp(input, actor);
  await createFollowUpRecord(store, followUp, actor);
  return { followUp, duplicateWarning: false };
}

function buildFollowUp(input: FollowUpInput, actor: string): FollowUp {
  const days = FOLLOW_UP_DAYS[input.followUpType] ?? 3;
  return {
    id: genId("FU"),
    leadId: input.leadId,
    storeName: input.storeName,
    contactName: input.contactName,
    phone: input.phone,
    issueType: input.issueType,
    holdDate: todayStr(),
    holdReason: input.holdReason,
    followUpType: input.followUpType,
    scheduledDate: input.scheduledDate || addDays(days),
    completed: false,
    customerStatus: "관심 유지",
    proposalMessage: "",
    nextAction: "",
    owner: input.owner,
    memo: input.memo ?? "",
    createdBy: actor,
    updatedBy: actor,
    updatedAt: nowIso(),
  };
}

// ===== CRM 재접촉 완료 흐름 =====
export type CompleteFollowUpResult = {
  followUp: FollowUp;
  leadStageUpdated: boolean;
  nextFollowUpCreated: boolean;
};

export async function completeFollowUpFlow(
  store: SheetStore,
  id: string,
  completion: FollowUpCompletion,
  actor: string,
  opts?: { createNext?: boolean }
): Promise<CompleteFollowUpResult> {
  // 1) 재접촉 완료 처리
  const completed = await updateFollowUpRecord(
    store,
    id,
    {
      completed: true,
      completedDate: completion.completedDate || todayStr(),
      customerStatus: completion.customerStatus,
      proposalMessage: completion.proposalMessage,
      nextAction: completion.nextAction,
      memo: completion.memo,
      completedBy: actor,
    },
    actor,
    "FOLLOW_UP_COMPLETE"
  );

  // 2) 고객 상태 -> 리드 현재 단계 자동 업데이트
  let leadStageUpdated = false;
  const mappedStage = CUSTOMER_STATUS_TO_STAGE[completion.customerStatus];
  if (mappedStage) {
    await updateLeadRecord(
      store,
      completed.leadId,
      { currentStage: mappedStage },
      actor,
      { reason: `재접촉 결과: ${completion.customerStatus}` }
    );
    leadStageUpdated = true;
  }

  // 3) 관심 유지면 다음 재접촉 자동 생성 (선택 시)
  let nextFollowUpCreated = false;
  if (opts?.createNext && completion.customerStatus === "관심 유지") {
    const nextType = NEXT_FOLLOW_UP_TYPE[completed.followUpType];
    if (nextType) {
      const days = FOLLOW_UP_DAYS[nextType] ?? 0;
      const next: FollowUp = {
        ...completed,
        id: genId("FU"),
        followUpType: nextType,
        scheduledDate: addDays(days),
        completed: false,
        completedDate: undefined,
        completedBy: undefined,
        proposalMessage: "",
        nextAction: "",
        memo: "",
        holdDate: todayStr(),
        createdBy: actor,
        updatedBy: actor,
        updatedAt: nowIso(),
      };
      await createFollowUpRecord(store, next, actor);
      nextFollowUpCreated = true;
    }
  }

  return { followUp: completed, leadStageUpdated, nextFollowUpCreated };
}

// ===== 인증(로그인/로그아웃) 기록 =====
export async function logAuthEvent(
  store: SheetStore,
  type: "LOGIN" | "LOGOUT",
  actor: string
): Promise<void> {
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: "(auth)",
    targetId: actor,
    changeType: type,
    memo:
      type === "LOGIN"
        ? "사용자가 로그인했습니다."
        : "사용자가 로그아웃했습니다.",
  });
}

// ===== 백업(EXPORT) 기록 =====
export async function logExportEvent(
  store: SheetStore,
  actor: string,
  memo: string
): Promise<void> {
  await appendChangeLog(store, {
    actorName: actor,
    targetSheet: "(export)",
    targetId: "backup",
    changeType: "EXPORT",
    memo,
  });
}

// ===== 백업용: 전체 탭 raw 데이터 =====
export async function readAllTabsRaw(
  store: SheetStore
): Promise<{ tab: TabName; headers: string[]; rows: string[][] }[]> {
  const out: { tab: TabName; headers: string[]; rows: string[][] }[] = [];
  for (const tab of ALL_TABS) {
    const rows = await store.readTab(tab);
    out.push({ tab, headers: HEADERS[tab], rows });
  }
  return out;
}

export async function readTabRaw(
  store: SheetStore,
  tab: TabName
): Promise<{ headers: string[]; rows: string[][] }> {
  const rows = await store.readTab(tab);
  return { headers: HEADERS[tab], rows };
}
