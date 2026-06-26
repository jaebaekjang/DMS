// ===== 초기 더미 데이터 (mock mode 최초 실행 시 1회 시드) =====
// 다양한 단계 / 문제 유형 / 업종 / 상태가 섞여 있도록 구성.

import { addDays, nowDateTimeStr, nowIso, todayStr } from "@/lib/dates";
import { genId } from "@/lib/ids";
import {
  changeLogToRow,
  consultationLogToRow,
  consultationToRow,
  followUpLogToRow,
  followUpToRow,
  leadSnapshotToRow,
  leadToRow,
  stageHistoryToRow,
  TABS,
  type TabName,
} from "@/lib/sheets/schema";
import type { Consultation, FollowUp, Lead } from "@/lib/types";

function leadIdFor(seq: number): string {
  const datePart = todayStr().replace(/-/g, "");
  return `DMS-${datePart}-${String(seq).padStart(4, "0")}`;
}

type LeadSeed = {
  store: string;
  contact: string;
  phone: string;
  industry: string;
  region: string;
  channel: string;
  issue: string;
  stage: string;
  need: Lead["managementNeed"];
  poss: Lead["contractPossibility"];
  owner: string;
  status: Lead["status"];
  daysAgo: number;
  next: string;
  symptom: string;
  result: string;
  visit: Consultation["visitDiagnosisNeeded"];
};

const SEEDS: LeadSeed[] = [
  { store: "카페 모카", contact: "김지현", phone: "010-1111-0001", industry: "카페", region: "서울", channel: "카카오톡", issue: "벌레", stage: "신규 문의", need: "중간", poss: "중간", owner: "CX 담당자", status: "활성", daysAgo: 0, next: "증상 사진 요청", symptom: "주방 쪽에 작은 날벌레가 보입니다.", result: "추가 상담 필요", visit: "판단 보류" },
  { store: "한끼정식", contact: "박민수", phone: "010-1111-0002", industry: "음식점", region: "경기", channel: "전화", issue: "냄새", stage: "상담 진행 중", need: "높음", poss: "중간", owner: "영업 담당자", status: "활성", daysAgo: 0, next: "전화 재상담", symptom: "홀에서 하수구 냄새가 올라옵니다.", result: "추가 상담 필요", visit: "필요" },
  { store: "포차한잔", contact: "이서연", phone: "010-1111-0003", industry: "술집", region: "인천", channel: "네이버톡톡", issue: "배수구", stage: "사진 및 증상 접수", need: "중간", poss: "중간", owner: "CX 담당자", status: "활성", daysAgo: 1, next: "사진 검토", symptom: "배수구가 자주 막힙니다.", result: "사진 요청", visit: "판단 보류" },
  { store: "튼튼정형외과", contact: "최원장", phone: "010-1111-0004", industry: "병원", region: "서울", channel: "랜딩폼", issue: "에어컨", stage: "방문 진단 예약", need: "높음", poss: "높음", owner: "현장 담당자", status: "활성", daysAgo: 2, next: "방문 일정 확정", symptom: "에어컨에서 곰팡이 냄새가 납니다.", result: "방문 진단 예약", visit: "필요" },
  { store: "스타일헤어", contact: "정미경", phone: "010-1111-0005", industry: "미용실", region: "부산", channel: "전화", issue: "후드", stage: "방문 진단 완료", need: "중간", poss: "높음", owner: "현장 담당자", status: "활성", daysAgo: 4, next: "플랜 제안서 발송", symptom: "후드 기름때가 심합니다.", result: "방문 진단 예약", visit: "필요" },
  { store: "에이스학원", contact: "한선생", phone: "010-1111-0006", industry: "학원", region: "대구", channel: "랜딩폼", issue: "화장실", stage: "정기관리 플랜 제안", need: "높음", poss: "높음", owner: "영업 담당자", status: "활성", daysAgo: 5, next: "플랜 컨펌 대기", symptom: "화장실 위생 관리가 필요합니다.", result: "방문 진단 예약", visit: "필요" },
  { store: "브런치카페", contact: "오하늘", phone: "010-1111-0007", industry: "카페", region: "경기", channel: "카카오톡", issue: "벌레", stage: "계약 조건 협의", need: "높음", poss: "높음", owner: "영업 담당자", status: "활성", daysAgo: 7, next: "계약서 검토", symptom: "초파리가 계속 발생합니다.", result: "방문 진단 예약", visit: "필요" },
  { store: "마라공방", contact: "서지훈", phone: "010-1111-0008", industry: "음식점", region: "서울", channel: "전화", issue: "냄새", stage: "보류", need: "중간", poss: "낮음", owner: "CX 담당자", status: "보류", daysAgo: 9, next: "3일 후 재접촉", symptom: "내부 검토 중이라 결정을 미뤘습니다.", result: "보류", visit: "판단 보류" },
  { store: "심야포차", contact: "강도현", phone: "010-1111-0009", industry: "술집", region: "광주", channel: "네이버톡톡", issue: "배수구", stage: "이탈", need: "낮음", poss: "낮음", owner: "CX 담당자", status: "이탈", daysAgo: 14, next: "-", symptom: "타업체와 계약했습니다.", result: "이탈", visit: "불필요" },
  { store: "연세이비인후과", contact: "윤간호", phone: "010-1111-0010", industry: "병원", region: "대전", channel: "랜딩폼", issue: "에어컨", stage: "구독 계약 완료", need: "높음", poss: "높음", owner: "대표님", status: "계약완료", daysAgo: 20, next: "정기관리 시작", symptom: "월 1회 정기관리로 계약했습니다.", result: "방문 진단 예약", visit: "필요" },
];

function buildSeed(): { leads: Lead[]; consultations: Consultation[]; followUps: FollowUp[] } {
  const leads: Lead[] = [];
  const consultations: Consultation[] = [];
  const followUps: FollowUp[] = [];

  SEEDS.forEach((s, i) => {
    const leadId = leadIdFor(i + 1);
    const receivedDate = addDays(-s.daysAgo);
    const createdAt = nowIso();

    const lead: Lead = {
      id: leadId,
      leadId,
      createdAt,
      receivedDate,
      storeName: s.store,
      contactName: s.contact,
      phone: s.phone,
      industry: s.industry,
      region: s.region,
      sourceChannel: s.channel,
      issueType: s.issue,
      currentStage: s.stage,
      managementNeed: s.need,
      contractPossibility: s.poss,
      owner: s.owner,
      nextAction: s.next,
      nextContactDate: s.status === "보류" ? addDays(3) : addDays(2),
      note: "",
      status: s.status,
      archived: false,
      createdBy: s.owner,
      updatedBy: s.owner,
      updatedAt: createdAt,
    };
    leads.push(lead);

    const consultation: Consultation = {
      id: genId("CONS"),
      leadId,
      createdAt,
      consultationDateTime: `${receivedDate} 10:00`,
      channel: s.channel,
      storeName: s.store,
      contactName: s.contact,
      phone: s.phone,
      industry: s.industry,
      region: s.region,
      issueType: s.issue,
      symptomText: s.symptom,
      storeSize: `${20 + i * 5}평`,
      managementNeed: s.need,
      photoRequested: s.result === "사진 요청",
      photoReceived: s.stage === "사진 및 증상 접수",
      visitDiagnosisNeeded: s.visit,
      consultationResult: s.result,
      nextAction: s.next,
      nextContactDate: lead.nextContactDate,
      memo: "",
      owner: s.owner,
      createdBy: s.owner,
      updatedBy: s.owner,
      updatedAt: createdAt,
    };
    consultations.push(consultation);

    // 보류 리드는 CRM 재접촉 시드 (오늘이 재접촉 예정일 -> 오늘 할 일에 노출)
    if (s.status === "보류") {
      followUps.push({
        id: genId("FU"),
        leadId,
        storeName: s.store,
        contactName: s.contact,
        phone: s.phone,
        issueType: s.issue,
        holdDate: receivedDate,
        holdReason: "내부 검토",
        followUpType: "3일 후",
        scheduledDate: todayStr(),
        completed: false,
        customerStatus: "관심 유지",
        proposalMessage: "",
        nextAction: "재접촉 통화",
        owner: s.owner,
        memo: "",
        createdBy: s.owner,
        updatedBy: s.owner,
        updatedAt: createdAt,
      });
    }
  });

  return { leads, consultations, followUps };
}

// mock store 최초 시드용 행 데이터
export function getSeedData(): Partial<Record<TabName, string[][]>> {
  const { leads, consultations, followUps } = buildSeed();
  const recordedAt = nowDateTimeStr();

  const seed: Partial<Record<TabName, string[][]>> = {
    [TABS.LEAD]: leads.map(leadToRow),
    [TABS.CONSULTATION]: consultations.map(consultationToRow),
    [TABS.FOLLOW_UP]: followUps.map(followUpToRow),
    [TABS.LEAD_SNAPSHOT]: leads.map((l) =>
      leadSnapshotToRow({
        id: genId("SNAP"),
        createdAt: recordedAt,
        changedBy: l.createdBy,
        changeType: "CREATE",
        leadId: l.leadId,
        receivedDate: l.receivedDate,
        storeName: l.storeName,
        contactName: l.contactName,
        phone: l.phone,
        industry: l.industry,
        region: l.region,
        sourceChannel: l.sourceChannel,
        issueType: l.issueType,
        currentStage: l.currentStage,
        managementNeed: l.managementNeed,
        contractPossibility: l.contractPossibility,
        owner: l.owner,
        nextAction: l.nextAction,
        nextContactDate: l.nextContactDate,
        note: l.note,
        status: l.status,
        archived: l.archived,
        archivedAt: l.archivedAt,
      })
    ),
    [TABS.CONSULTATION_LOG]: consultations.map((c) =>
      consultationLogToRow(c, {
        logId: genId("CLOG"),
        recordedAt,
        changedBy: c.createdBy,
        changeType: "CREATE",
      })
    ),
    [TABS.FOLLOW_UP_LOG]: followUps.map((f) =>
      followUpLogToRow(f, {
        logId: genId("FLOG"),
        recordedAt,
        changedBy: f.createdBy,
        changeType: "FOLLOW_UP_CREATE",
      })
    ),
    [TABS.STAGE_HISTORY]: leads.map((l) =>
      stageHistoryToRow({
        id: genId("SH"),
        leadId: l.leadId,
        createdAt: recordedAt,
        changedBy: l.createdBy,
        previousStage: "",
        newStage: l.currentStage,
        reason: "최초 생성",
        memo: "상담 접수로 리드 생성",
      })
    ),
    [TABS.CHANGE_LOG]: leads.map((l) =>
      changeLogToRow({
        id: genId("LOG"),
        createdAt: recordedAt,
        actorName: l.createdBy,
        targetSheet: TABS.LEAD,
        targetId: l.leadId,
        leadId: l.leadId,
        changeType: "CREATE",
        memo: "초기 더미 데이터 생성",
      })
    ),
    // 계약완료 리드 1건은 아카이브 예시로 미리 보관하지 않고, 사용자가 직접 처리하도록 비워둠
    [TABS.ARCHIVE_LEAD]: [],
    [TABS.ARCHIVE_CONSULTATION]: [],
    [TABS.ARCHIVE_FOLLOW_UP]: [],
  };

  return seed;
}
