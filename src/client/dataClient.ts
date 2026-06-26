// ===== 클라이언트 데이터 접근 계층 =====
// 페이지/컴포넌트는 항상 이 모듈만 사용한다.
// mock mode  -> service 를 localStorage store 로 직접 호출 (브라우저)
// real mode  -> 서버 API route 호출 (Google Sheets 는 서버에서만 처리)
//
// 주의: 이 파일은 클라이언트 번들에 포함되므로 googleSheetsService 를 import 하지 않는다.

import { ARCHIVABLE_STATUSES } from "@/lib/constants";
import { USE_MOCK_DATA } from "@/lib/config";
import type { TabName } from "@/lib/sheets/schema";
import type { SheetStore } from "@/lib/sheets/store";
import type {
  Consultation,
  DataChangeLog,
  FollowUp,
  Lead,
  LeadSnapshot,
  LeadStatus,
  StageHistory,
} from "@/lib/types";
import type {
  CompleteFollowUpResult,
  ConsultationInput,
  CreateConsultationOptions,
  CreateConsultationResult,
  FollowUpCompletion,
  FollowUpInput,
  UpdateLeadResult,
} from "@/services/crmService";

import { getMockStore } from "@/services/mockStorageService";
import {
  completeFollowUpFlow,
  createConsultationFlow,
  createFollowUpFlow,
  logAuthEvent,
  logExportEvent,
  readAllTabsRaw,
  updateLeadFlow,
} from "@/services/crmService";
import {
  listConsultations,
  listConsultationsByLead,
  updateConsultationRecord,
} from "@/services/consultationService";
import {
  listFollowUps,
  listFollowUpsByLead,
  updateFollowUpRecord,
} from "@/services/followUpService";
import {
  getLead as svcGetLead,
  listLeads,
  softDeleteLead as svcSoftDelete,
} from "@/services/leadService";
import {
  listChangeLog,
  listSnapshotsByLead,
  listStageHistory,
  listStageHistoryByLead,
} from "@/services/historyService";
import {
  archiveLeadRecord,
  listArchivableLeads,
  listArchiveLeads,
  restoreLeadRecord,
  runArchiveSweep,
} from "@/services/archiveService";
import type { ArchiveLead } from "@/lib/types";

export type TabBackup = { tab: TabName; headers: string[]; rows: string[][] };

export interface DataClient {
  ensureSheets(): Promise<void>;
  listLeads(): Promise<Lead[]>;
  getLead(leadId: string): Promise<Lead | null>;
  listArchivableLeads(): Promise<Lead[]>;
  listArchiveLeads(): Promise<ArchiveLead[]>;
  listConsultations(leadId?: string): Promise<Consultation[]>;
  listFollowUps(leadId?: string): Promise<FollowUp[]>;
  listStageHistory(leadId?: string): Promise<StageHistory[]>;
  listSnapshots(leadId: string): Promise<LeadSnapshot[]>;
  listChangeLog(): Promise<DataChangeLog[]>;

  createConsultation(
    input: ConsultationInput,
    actor: string,
    opts?: CreateConsultationOptions
  ): Promise<CreateConsultationResult>;
  updateLead(
    leadId: string,
    updates: Partial<Lead>,
    actor: string,
    opts?: { holdReason?: string; reason?: string }
  ): Promise<UpdateLeadResult>;
  softDeleteLead(
    leadId: string,
    status: LeadStatus,
    actor: string
  ): Promise<void>;
  updateConsultation(
    id: string,
    updates: Partial<Consultation>,
    actor: string
  ): Promise<Consultation>;
  createFollowUp(
    input: FollowUpInput,
    actor: string
  ): Promise<{ followUp: FollowUp; duplicateWarning: boolean }>;
  updateFollowUp(
    id: string,
    updates: Partial<FollowUp>,
    actor: string
  ): Promise<FollowUp>;
  completeFollowUp(
    id: string,
    completion: FollowUpCompletion,
    actor: string,
    opts?: { createNext?: boolean }
  ): Promise<CompleteFollowUpResult>;
  archiveLead(
    leadId: string,
    actor: string
  ): Promise<{ archived: boolean; skipped?: boolean }>;
  restoreLead(
    leadId: string,
    actor: string,
    restoreStage?: string
  ): Promise<Lead>;
  runArchiveSweep(actor: string): Promise<{ count: number }>;

  logAuth(type: "LOGIN" | "LOGOUT", actor: string): Promise<void>;
  logExport(actor: string, memo: string): Promise<void>;
  getBackupData(actor: string): Promise<TabBackup[]>;
}

// ====================== Mock 구현 ======================
function mockClient(): DataClient {
  const store: SheetStore = getMockStore();
  const ready = async () => {
    await store.ensureSheets();
    return store;
  };
  return {
    async ensureSheets() {
      await store.ensureSheets();
    },
    async listLeads() {
      return listLeads(await ready());
    },
    async getLead(leadId) {
      return svcGetLead(await ready(), leadId);
    },
    async listArchivableLeads() {
      return listArchivableLeads(await ready());
    },
    async listArchiveLeads() {
      return listArchiveLeads(await ready());
    },
    async listConsultations(leadId) {
      const s = await ready();
      return leadId ? listConsultationsByLead(s, leadId) : listConsultations(s);
    },
    async listFollowUps(leadId) {
      const s = await ready();
      return leadId ? listFollowUpsByLead(s, leadId) : listFollowUps(s);
    },
    async listStageHistory(leadId) {
      const s = await ready();
      return leadId ? listStageHistoryByLead(s, leadId) : listStageHistory(s);
    },
    async listSnapshots(leadId) {
      return listSnapshotsByLead(await ready(), leadId);
    },
    async listChangeLog() {
      return listChangeLog(await ready());
    },
    async createConsultation(input, actor, opts) {
      return createConsultationFlow(await ready(), input, actor, opts);
    },
    async updateLead(leadId, updates, actor, opts) {
      return updateLeadFlow(await ready(), leadId, updates, actor, opts);
    },
    async softDeleteLead(leadId, status, actor) {
      await svcSoftDelete(await ready(), leadId, status, actor);
    },
    async updateConsultation(id, updates, actor) {
      return updateConsultationRecord(await ready(), id, updates, actor);
    },
    async createFollowUp(input, actor) {
      return createFollowUpFlow(await ready(), input, actor);
    },
    async updateFollowUp(id, updates, actor) {
      return updateFollowUpRecord(await ready(), id, updates, actor);
    },
    async completeFollowUp(id, completion, actor, opts) {
      return completeFollowUpFlow(await ready(), id, completion, actor, opts);
    },
    async archiveLead(leadId, actor) {
      const res = await archiveLeadRecord(await ready(), leadId, actor);
      return { archived: res.archived, skipped: res.skipped };
    },
    async restoreLead(leadId, actor, restoreStage) {
      return restoreLeadRecord(await ready(), leadId, actor, restoreStage);
    },
    async runArchiveSweep(actor) {
      return runArchiveSweep(await ready(), actor);
    },
    async logAuth(type, actor) {
      await logAuthEvent(await ready(), type, actor);
    },
    async logExport(actor, memo) {
      await logExportEvent(await ready(), actor, memo);
    },
    async getBackupData(actor) {
      const s = await ready();
      const tabs = await readAllTabsRaw(s);
      await logExportEvent(s, actor, "전체 데이터 백업(ZIP) 다운로드");
      return tabs;
    },
  };
}

// ====================== API(real) 구현 ======================
async function req<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(json?.error || `요청 실패 (${res.status})`);
  }
  return json as T;
}

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v) as [
    string,
    string
  ][];
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries).toString();
}

function apiClient(): DataClient {
  return {
    async ensureSheets() {
      await req("POST", "/api/sheets/init");
    },
    async listLeads() {
      const { leads } = await req<{ leads: Lead[] }>("GET", "/api/leads");
      return leads;
    },
    async getLead(leadId) {
      const { leads } = await req<{ leads: Lead[] }>("GET", "/api/leads");
      return leads.find((l) => l.leadId === leadId) ?? null;
    },
    async listArchivableLeads() {
      const { leads } = await req<{ leads: Lead[] }>("GET", "/api/leads");
      return leads.filter(
        (l) => ARCHIVABLE_STATUSES.includes(l.status) && !l.archived
      );
    },
    async listArchiveLeads() {
      const { items } = await req<{ items: ArchiveLead[] }>("GET", "/api/archive");
      return items;
    },
    async listConsultations(leadId) {
      const { items } = await req<{ items: Consultation[] }>(
        "GET",
        "/api/consultations" + qs({ leadId })
      );
      return items;
    },
    async listFollowUps(leadId) {
      const { items } = await req<{ items: FollowUp[] }>(
        "GET",
        "/api/follow-ups" + qs({ leadId })
      );
      return items;
    },
    async listStageHistory(leadId) {
      const { items } = await req<{ items: StageHistory[] }>(
        "GET",
        "/api/stage-history" + qs({ leadId })
      );
      return items;
    },
    async listSnapshots(leadId) {
      const { items } = await req<{ items: LeadSnapshot[] }>(
        "GET",
        "/api/snapshots" + qs({ leadId })
      );
      return items;
    },
    async listChangeLog() {
      const { items } = await req<{ items: DataChangeLog[] }>(
        "GET",
        "/api/change-log"
      );
      return items;
    },
    async createConsultation(input, actor, opts) {
      return req<CreateConsultationResult>("POST", "/api/consultations", {
        input,
        actor,
        opts,
      });
    },
    async updateLead(leadId, updates, actor, opts) {
      return req<UpdateLeadResult>(
        "PUT",
        `/api/leads/${encodeURIComponent(leadId)}`,
        { action: "update", updates, actor, opts }
      );
    },
    async softDeleteLead(leadId, status, actor) {
      await req("PUT", `/api/leads/${encodeURIComponent(leadId)}`, {
        action: "soft-delete",
        status,
        actor,
      });
    },
    async updateConsultation(id, updates, actor) {
      const { item } = await req<{ item: Consultation }>(
        "PUT",
        `/api/consultations/${encodeURIComponent(id)}`,
        { updates, actor }
      );
      return item;
    },
    async createFollowUp(input, actor) {
      return req<{ followUp: FollowUp; duplicateWarning: boolean }>(
        "POST",
        "/api/follow-ups",
        { input, actor }
      );
    },
    async updateFollowUp(id, updates, actor) {
      const { item } = await req<{ item: FollowUp }>(
        "PUT",
        `/api/follow-ups/${encodeURIComponent(id)}`,
        { action: "update", updates, actor }
      );
      return item;
    },
    async completeFollowUp(id, completion, actor, opts) {
      return req<CompleteFollowUpResult>(
        "PUT",
        `/api/follow-ups/${encodeURIComponent(id)}`,
        { action: "complete", completion, actor, opts }
      );
    },
    async archiveLead(leadId, actor) {
      return req<{ archived: boolean; skipped?: boolean }>(
        "POST",
        "/api/archive",
        { leadId, actor }
      );
    },
    async restoreLead(leadId, actor, restoreStage) {
      const { lead } = await req<{ lead: Lead }>("POST", "/api/archive/restore", {
        leadId,
        actor,
        restoreStage,
      });
      return lead;
    },
    async runArchiveSweep(actor) {
      return req<{ count: number }>("POST", "/api/archive/run", { actor });
    },
    async logAuth(type, actor) {
      await req("POST", "/api/log", { kind: "auth", type, actor });
    },
    async logExport(actor, memo) {
      await req("POST", "/api/log", { kind: "export", actor, memo });
    },
    async getBackupData(actor) {
      const { tabs } = await req<{ tabs: TabBackup[] }>(
        "GET",
        "/api/export/backup" + qs({ actor })
      );
      return tabs;
    },
  };
}

export const data: DataClient = USE_MOCK_DATA ? mockClient() : apiClient();
