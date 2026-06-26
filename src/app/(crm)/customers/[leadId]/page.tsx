"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { data } from "@/client/dataClient";
import type {
  Consultation,
  FollowUp,
  Lead,
  LeadSnapshot,
  StageHistory,
} from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { useToast } from "@/components/Toast";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageTitle,
  needTone,
  stageTone,
  statusTone,
} from "@/components/ui";

export default function CustomerDetailPage() {
  const params = useParams<{ leadId: string }>();
  const leadId = decodeURIComponent(
    Array.isArray(params.leadId) ? params.leadId[0] : params.leadId
  );
  const toast = useToast();

  const [lead, setLead] = useState<Lead | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [stages, setStages] = useState<StageHistory[]>([]);
  const [snapshots, setSnapshots] = useState<LeadSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, cs, fu, sh, sn] = await Promise.all([
        data.getLead(leadId),
        data.listConsultations(leadId),
        data.listFollowUps(leadId),
        data.listStageHistory(leadId),
        data.listSnapshots(leadId),
      ]);
      setLead(l);
      setConsultations(cs);
      setFollowUps(fu);
      setStages(sh);
      setSnapshots(sn);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "고객 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [leadId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">불러오는 중...</div>;
  }
  if (!lead) {
    return (
      <div>
        <EmptyState message="해당 리드를 찾을 수 없습니다." />
        <div className="text-center">
          <Link href="/leads"><Button variant="secondary">리드 마스터로</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title={`고객 상세 · ${lead.storeName}`} description={lead.leadId}>
        <Link href="/leads"><Button variant="secondary">← 리드 마스터</Button></Link>
      </PageTitle>

      {/* 기본 정보 */}
      <Card className="mb-5 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={stageTone(lead.currentStage)}>{lead.currentStage}</Badge>
          <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>
          <Badge tone={needTone(lead.managementNeed)}>관리 {lead.managementNeed}</Badge>
          <Badge tone={needTone(lead.contractPossibility)}>계약 가능성 {lead.contractPossibility}</Badge>
          {lead.archived && <Badge tone="slate">아카이브됨</Badge>}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3 lg:grid-cols-4">
          <Info label="담당자명" value={lead.contactName} />
          <Info label="연락처" value={lead.phone} />
          <Info label="업종" value={lead.industry} />
          <Info label="지역" value={lead.region} />
          <Info label="유입 채널" value={lead.sourceChannel} />
          <Info label="문제 유형" value={lead.issueType} />
          <Info label="접수일" value={lead.receivedDate} />
          <Info label="담당자" value={lead.owner} />
          <Info label="다음 액션" value={lead.nextAction} />
          <Info label="다음 연락일" value={lead.nextContactDate} />
          <Info label="비고" value={lead.note} />
          <Info label="생성자" value={lead.createdBy} />
          <Info label="최근 수정자" value={lead.updatedBy} />
          <Info label="최근 수정일" value={lead.updatedAt} />
        </div>
      </Card>

      <Section title={`상담 이력 (${consultations.length})`}>
        <DataTable
          rows={consultations}
          rowKey={(c) => c.id}
          emptyMessage="상담 이력이 없습니다."
          columns={consultationCols}
        />
      </Section>

      <Section title={`CRM 재접촉 이력 (${followUps.length})`}>
        <DataTable
          rows={followUps}
          rowKey={(x) => x.id}
          emptyMessage="재접촉 이력이 없습니다."
          columns={followUpCols}
        />
      </Section>

      <Section title={`상태 변경 이력 (${stages.length})`}>
        <DataTable
          rows={[...stages].reverse()}
          rowKey={(s) => s.id}
          emptyMessage="상태 변경 이력이 없습니다."
          columns={stageCols}
        />
      </Section>

      <Section title={`리드 스냅샷 이력 (${snapshots.length})`}>
        <DataTable
          rows={[...snapshots].reverse()}
          rowKey={(s) => s.id}
          emptyMessage="스냅샷 이력이 없습니다."
          columns={snapshotCols}
        />
      </Section>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-gray-800">{value || "-"}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="mb-2 text-sm font-semibold text-gray-700">{title}</h2>
      <div className="rounded-lg border border-gray-200 bg-white">{children}</div>
    </div>
  );
}

const consultationCols: Column<Consultation>[] = [
  { header: "상담일시", cell: (c) => c.consultationDateTime },
  { header: "채널", cell: (c) => c.channel },
  { header: "증상", cell: (c) => <span className="block max-w-[260px] truncate" title={c.symptomText}>{c.symptomText}</span> },
  { header: "사진 요청", cell: (c) => (c.photoRequested ? "예" : "아니오") },
  { header: "사진 수신", cell: (c) => (c.photoReceived ? "예" : "아니오") },
  { header: "방문 진단", cell: (c) => c.visitDiagnosisNeeded },
  { header: "상담 결과", cell: (c) => <Badge tone={stageTone(c.consultationResult)}>{c.consultationResult}</Badge> },
  { header: "상담 메모", cell: (c) => <span className="text-gray-500">{c.memo}</span> },
  { header: "담당자", cell: (c) => c.owner },
  { header: "생성자", cell: (c) => c.createdBy },
  { header: "수정자", cell: (c) => c.updatedBy },
];

const followUpCols: Column<FollowUp>[] = [
  { header: "보류 발생일", cell: (x) => x.holdDate },
  { header: "보류 사유", cell: (x) => x.holdReason },
  { header: "재접촉 구분", cell: (x) => <Badge tone="blue">{x.followUpType}</Badge> },
  { header: "예정일", cell: (x) => x.scheduledDate },
  { header: "완료 여부", cell: (x) => (x.completed ? <Badge tone="green">완료</Badge> : <Badge tone="amber">미완료</Badge>) },
  { header: "완료일", cell: (x) => x.completedDate ?? "-" },
  { header: "고객 상태", cell: (x) => x.customerStatus },
  { header: "재제안 내용", cell: (x) => <span className="text-gray-600">{x.proposalMessage}</span> },
  { header: "다음 액션", cell: (x) => x.nextAction },
  { header: "메모", cell: (x) => <span className="text-gray-500">{x.memo}</span> },
  { header: "생성자", cell: (x) => x.createdBy },
  { header: "완료자", cell: (x) => x.completedBy ?? "-" },
];

const stageCols: Column<StageHistory>[] = [
  { header: "변경일시", cell: (s) => s.createdAt },
  { header: "변경자", cell: (s) => s.changedBy },
  { header: "변경 전", cell: (s) => <Badge tone="gray">{s.previousStage || "-"}</Badge> },
  { header: "변경 후", cell: (s) => <Badge tone={stageTone(s.newStage)}>{s.newStage}</Badge> },
  { header: "사유", cell: (s) => s.reason },
  { header: "메모", cell: (s) => <span className="text-gray-500">{s.memo}</span> },
];

const snapshotCols: Column<LeadSnapshot>[] = [
  { header: "기록일시", cell: (s) => s.createdAt },
  { header: "변경자", cell: (s) => s.changedBy },
  { header: "변경 유형", cell: (s) => <Badge tone="slate">{s.changeType}</Badge> },
  { header: "현재 단계", cell: (s) => <Badge tone={stageTone(s.currentStage)}>{s.currentStage}</Badge> },
  { header: "상태", cell: (s) => <Badge tone={statusTone(s.status)}>{s.status}</Badge> },
  { header: "관리 필요도", cell: (s) => s.managementNeed },
  { header: "계약 가능성", cell: (s) => s.contractPossibility },
  { header: "담당자", cell: (s) => s.owner },
  { header: "다음 액션", cell: (s) => s.nextAction },
  { header: "다음 연락일", cell: (s) => s.nextContactDate },
];
