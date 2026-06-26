// ===== 운영에 필요한 선택 옵션 / 기본값 상수 =====
// 초기에는 코드 상수로 관리하되, 추후 설정 페이지에서 관리 가능하도록 분리.

import type {
  ContractPossibility,
  FollowUpType,
  LeadStatus,
  ManagementNeed,
  VisitDiagnosisNeeded,
} from "./types";

// 현재 단계 옵션 (사람이 직접 선택)
export const STAGE_OPTIONS = [
  "신규 문의",
  "상담 진행 중",
  "사진 및 증상 접수",
  "방문 진단 예약",
  "방문 진단 완료",
  "정기관리 플랜 제안",
  "계약 조건 협의",
  "구독 계약 완료",
  "보류",
  "이탈",
  "종료",
] as const;

export const MANAGEMENT_NEED_OPTIONS: ManagementNeed[] = ["낮음", "중간", "높음"];

export const CONTRACT_POSSIBILITY_OPTIONS: ContractPossibility[] = [
  "낮음",
  "중간",
  "높음",
];

export const STATUS_OPTIONS: LeadStatus[] = [
  "활성",
  "보류",
  "이탈",
  "종료",
  "계약완료",
  "비활성",
  "삭제됨",
  "아카이브됨",
];

export const CHANNEL_OPTIONS = [
  "전화",
  "카카오톡",
  "네이버톡톡",
  "랜딩폼",
  "기타",
];

export const ISSUE_TYPE_OPTIONS = [
  "벌레",
  "냄새",
  "에어컨",
  "후드",
  "배수구",
  "화장실",
  "기타",
];

export const VISIT_DIAGNOSIS_OPTIONS: VisitDiagnosisNeeded[] = [
  "필요",
  "불필요",
  "판단 보류",
];

export const CONSULTATION_RESULT_OPTIONS = [
  "방문 진단 예약",
  "사진 요청",
  "추가 상담 필요",
  "보류",
  "이탈",
];

export const HOLD_REASON_OPTIONS = [
  "가격 부담",
  "필요성 부족",
  "일정 미정",
  "타업체 비교",
  "내부 검토",
  "연락 두절",
  "기타",
];

export const FOLLOW_UP_TYPE_OPTIONS: FollowUpType[] = [
  "3일 후",
  "14일 후",
  "30일 후",
  "수동 재접촉",
];

export const CUSTOMER_STATUS_OPTIONS = [
  "관심 유지",
  "계약 검토",
  "재방문 필요",
  "플랜 재제안 필요",
  "이탈",
  "종료",
];

export const INDUSTRY_OPTIONS = [
  "카페",
  "음식점",
  "술집",
  "병원",
  "미용실",
  "학원",
  "기타",
];

export const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "기타",
];

// 자주 사용하는 로그인 이름 목록 (역할/권한 부여 없음)
export const DEFAULT_USERS = [
  "장재백",
  "대표님",
  "CX 담당자",
  "영업 담당자",
  "현장 담당자",
  "마케팅 담당자",
];

export const OWNER_OPTIONS = DEFAULT_USERS;

// ===== 단순 상태 매핑 (AI 판단 아님 / 사람이 선택한 값에 따른 단순 매핑) =====

// 상담 결과 -> 리드 마스터 현재 단계
export const CONSULTATION_RESULT_TO_STAGE: Record<string, string> = {
  "방문 진단 예약": "방문 진단 예약",
  "사진 요청": "사진 및 증상 접수",
  "추가 상담 필요": "상담 진행 중",
  보류: "보류",
  이탈: "이탈",
};

// CRM 재접촉 고객 상태 -> 리드 마스터 현재 단계
export const CUSTOMER_STATUS_TO_STAGE: Record<string, string> = {
  "계약 검토": "계약 조건 협의",
  "플랜 재제안 필요": "정기관리 플랜 제안",
  "재방문 필요": "방문 진단 예약",
  이탈: "이탈",
  종료: "종료",
  "관심 유지": "보류",
};

// 재접촉 구분별 다음 재접촉 일수 / 다음 단계
export const FOLLOW_UP_DAYS: Record<FollowUpType, number> = {
  "3일 후": 3,
  "14일 후": 14,
  "30일 후": 30,
  "수동 재접촉": 0,
};

// 관심 유지 시 다음 재접촉 구분 자동 제안
export const NEXT_FOLLOW_UP_TYPE: Record<string, FollowUpType | null> = {
  "3일 후": "14일 후",
  "14일 후": "30일 후",
  "30일 후": "수동 재접촉",
  "수동 재접촉": null,
};

// 아카이브 대상이 되는 상태
export const ARCHIVABLE_STATUSES: LeadStatus[] = [
  "계약완료",
  "이탈",
  "종료",
  "삭제됨",
  "비활성",
];

// 현재 단계 -> 상태 자동 매핑 (단계 변경 시 리드 status 동기화)
export const STAGE_TO_STATUS: Record<string, LeadStatus> = {
  "구독 계약 완료": "계약완료",
  보류: "보류",
  이탈: "이탈",
  종료: "종료",
};
