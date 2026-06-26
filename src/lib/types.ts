// ===== DM'S CX 운영 CRM 공통 타입 정의 =====

export type ManagementNeed = "낮음" | "중간" | "높음";
export type ContractPossibility = "낮음" | "중간" | "높음";

export type LeadStatus =
  | "활성"
  | "보류"
  | "이탈"
  | "종료"
  | "계약완료"
  | "비활성"
  | "삭제됨"
  | "아카이브됨";

export type VisitDiagnosisNeeded = "필요" | "불필요" | "판단 보류";

export type FollowUpType = "3일 후" | "14일 후" | "30일 후" | "수동 재접촉";

export type ChangeType =
  | "CREATE"
  | "UPDATE"
  | "STAGE_CHANGE"
  | "FOLLOW_UP_CREATE"
  | "FOLLOW_UP_COMPLETE"
  | "SOFT_DELETE"
  | "ARCHIVE"
  | "RESTORE"
  | "EXPORT"
  | "LOGIN"
  | "LOGOUT"
  | "CREATE_CONSULTATION"
  | "ERROR";

// 이름 로그인용 사용자 구조 (이메일/역할/사용자ID 미사용)
export type User = {
  name: string;
};

export type Lead = {
  id: string;
  leadId: string;
  createdAt: string;
  receivedDate: string;
  storeName: string;
  contactName: string;
  phone: string;
  industry: string;
  region: string;
  sourceChannel: string;
  issueType: string;
  currentStage: string;
  managementNeed: ManagementNeed;
  contractPossibility: ContractPossibility;
  owner: string;
  nextAction: string;
  nextContactDate: string;
  note: string;
  status: LeadStatus;
  archived: boolean;
  archivedAt?: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
};

export type Consultation = {
  id: string;
  leadId: string;
  createdAt: string;
  consultationDateTime: string;
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
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
};

export type FollowUp = {
  id: string;
  leadId: string;
  storeName: string;
  contactName: string;
  phone: string;
  issueType: string;
  holdDate: string;
  holdReason: string;
  followUpType: FollowUpType;
  scheduledDate: string;
  completed: boolean;
  completedDate?: string;
  customerStatus: string;
  proposalMessage: string;
  nextAction: string;
  owner: string;
  memo: string;
  createdBy: string;
  updatedBy: string;
  completedBy?: string;
  updatedAt: string;
};

export type StageHistory = {
  id: string;
  leadId: string;
  createdAt: string;
  changedBy: string;
  previousStage: string;
  newStage: string;
  reason: string;
  memo: string;
};

export type DataChangeLog = {
  id: string;
  createdAt: string;
  actorName: string;
  targetSheet: string;
  targetId: string;
  leadId?: string;
  changeType: ChangeType;
  changedField?: string;
  beforeValue?: string;
  afterValue?: string;
  memo: string;
};

// 리드 스냅샷 로그 (수정 시 전체 값을 누적 저장)
export type LeadSnapshot = {
  id: string;
  createdAt: string;
  changedBy: string;
  changeType: string;
  leadId: string;
  receivedDate: string;
  storeName: string;
  contactName: string;
  phone: string;
  industry: string;
  region: string;
  sourceChannel: string;
  issueType: string;
  currentStage: string;
  managementNeed: string;
  contractPossibility: string;
  owner: string;
  nextAction: string;
  nextContactDate: string;
  note: string;
  status: string;
  archived: boolean;
  archivedAt?: string;
};

export type ArchiveLead = {
  archiveId: string;
  archivedAt: string;
  leadId: string;
  receivedDate: string;
  storeName: string;
  contactName: string;
  phone: string;
  industry: string;
  region: string;
  sourceChannel: string;
  issueType: string;
  currentStage: string;
  managementNeed: string;
  contractPossibility: string;
  owner: string;
  nextAction: string;
  nextContactDate: string;
  note: string;
  status: string;
};
