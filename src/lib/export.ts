// 페이지별 CSV 다운로드 (필터가 적용된 결과를 그대로 내보낼 수 있도록 객체 배열을 받는다)

import { downloadCsv, toCsv, triggerDownload } from "./csv";
import {
  HEADERS,
  TABS,
  changeLogToRow,
  consultationToRow,
  followUpToRow,
  leadToRow,
  stageHistoryToRow,
  type TabName,
} from "./sheets/schema";
import type {
  ArchiveLead,
  Consultation,
  DataChangeLog,
  FollowUp,
  Lead,
  StageHistory,
} from "./types";

export function exportLeadsCsv(leads: Lead[]): void {
  downloadCsv("리드마스터.csv", toCsv(HEADERS[TABS.LEAD], leads.map(leadToRow)));
}

export function exportConsultationsCsv(items: Consultation[]): void {
  downloadCsv(
    "상담접수.csv",
    toCsv(HEADERS[TABS.CONSULTATION], items.map(consultationToRow))
  );
}

export function exportFollowUpsCsv(items: FollowUp[]): void {
  downloadCsv(
    "CRM재접촉.csv",
    toCsv(HEADERS[TABS.FOLLOW_UP], items.map(followUpToRow))
  );
}

export function exportStageHistoryCsv(items: StageHistory[]): void {
  downloadCsv(
    "상태변경이력.csv",
    toCsv(HEADERS[TABS.STAGE_HISTORY], items.map(stageHistoryToRow))
  );
}

export function exportChangeLogCsv(items: DataChangeLog[]): void {
  downloadCsv(
    "데이터변경로그.csv",
    toCsv(HEADERS[TABS.CHANGE_LOG], items.map(changeLogToRow))
  );
}

export function exportArchiveLeadsCsv(items: ArchiveLead[]): void {
  const rows = items.map((a) => [
    a.archiveId, a.archivedAt, a.leadId, a.receivedDate, a.storeName,
    a.contactName, a.phone, a.industry, a.region, a.sourceChannel, a.issueType,
    a.currentStage, a.managementNeed, a.contractPossibility, a.owner,
    a.nextAction, a.nextContactDate, a.note, a.status,
  ]);
  downloadCsv("아카이브_리드.csv", toCsv(HEADERS[TABS.ARCHIVE_LEAD], rows));
}

// 전체 백업 ZIP (탭별 CSV 파일을 ZIP 으로 묶음)
export async function downloadBackupZip(
  tabs: { tab: TabName; headers: string[]; rows: string[][] }[]
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  for (const { tab, headers, rows } of tabs) {
    zip.file(`${tab}.csv`, toCsv(headers, rows));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(`DMS_CRM_백업_${stamp}.zip`, blob);
}
