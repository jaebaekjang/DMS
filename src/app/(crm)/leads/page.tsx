"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { data } from "@/client/dataClient";
import {
  CONTRACT_POSSIBILITY_OPTIONS,
  HOLD_REASON_OPTIONS,
  INDUSTRY_OPTIONS,
  ISSUE_TYPE_OPTIONS,
  MANAGEMENT_NEED_OPTIONS,
  OWNER_OPTIONS,
  REGION_OPTIONS,
  STAGE_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { todayStr } from "@/lib/dates";
import { exportLeadsCsv } from "@/lib/export";
import type { Lead } from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useCurrentUserName } from "@/components/UserContext";
import {
  Badge,
  Button,
  Input,
  Labeled,
  PageTitle,
  Select,
  SummaryCard,
  Textarea,
  needTone,
  stageTone,
  statusTone,
} from "@/components/ui";

const EMPTY_FILTERS = {
  receivedDate: "",
  stage: "",
  industry: "",
  region: "",
  issueType: "",
  need: "",
  poss: "",
  owner: "",
  channel: "",
};

export default function LeadsPage() {
  const toast = useToast();
  const user = useCurrentUserName();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ ...EMPTY_FILTERS });
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLeads(await data.listLeads());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "리드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const owners = useMemo(() => {
    const set = new Set<string>(OWNER_OPTIONS);
    leads.forEach((l) => l.owner && set.add(l.owner));
    return Array.from(set);
  }, [leads]);

  const channels = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => l.sourceChannel && set.add(l.sourceChannel));
    return Array.from(set);
  }, [leads]);

  const filtered = useMemo(() => {
    const query = q.trim();
    return leads.filter((l) => {
      if (f.receivedDate && l.receivedDate !== f.receivedDate) return false;
      if (f.stage && l.currentStage !== f.stage) return false;
      if (f.industry && l.industry !== f.industry) return false;
      if (f.region && l.region !== f.region) return false;
      if (f.issueType && l.issueType !== f.issueType) return false;
      if (f.need && l.managementNeed !== f.need) return false;
      if (f.poss && l.contractPossibility !== f.poss) return false;
      if (f.owner && l.owner !== f.owner) return false;
      if (f.channel && l.sourceChannel !== f.channel) return false;
      if (
        query &&
        ![l.storeName, l.contactName, l.phone].some((v) =>
          (v ?? "").includes(query)
        )
      )
        return false;
      return true;
    });
  }, [leads, f, q]);

  const countStage = (stage: string) =>
    leads.filter((l) => l.currentStage === stage).length;

  const columns: Column<Lead>[] = [
    { header: "리드 ID", cell: (l) => <span className="font-mono text-xs text-gray-500">{l.leadId}</span> },
    { header: "접수일", cell: (l) => l.receivedDate },
    {
      header: "상호명",
      cell: (l) => (
        <Link
          href={`/customers/${encodeURIComponent(l.leadId)}`}
          className="font-medium text-brand hover:underline"
        >
          {l.storeName}
        </Link>
      ),
    },
    { header: "담당자명", cell: (l) => l.contactName },
    { header: "연락처", cell: (l) => l.phone },
    { header: "업종", cell: (l) => l.industry },
    { header: "지역", cell: (l) => l.region },
    { header: "유입 채널", cell: (l) => l.sourceChannel },
    { header: "문제 유형", cell: (l) => l.issueType },
    { header: "현재 단계", cell: (l) => <Badge tone={stageTone(l.currentStage)}>{l.currentStage}</Badge> },
    { header: "관리 필요도", cell: (l) => <Badge tone={needTone(l.managementNeed)}>{l.managementNeed}</Badge> },
    { header: "계약 가능성", cell: (l) => <Badge tone={needTone(l.contractPossibility)}>{l.contractPossibility}</Badge> },
    { header: "담당자", cell: (l) => l.owner },
    { header: "다음 액션", cell: (l) => <span className="text-gray-600">{l.nextAction}</span> },
    { header: "다음 연락일", cell: (l) => l.nextContactDate },
    { header: "비고", cell: (l) => <span className="text-gray-500">{l.note}</span> },
    { header: "상태", cell: (l) => <Badge tone={statusTone(l.status)}>{l.status}</Badge> },
    {
      header: "관리",
      cell: (l) => (
        <Button size="sm" variant="secondary" onClick={() => setEditing(l)}>
          수정
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title="리드 마스터" description="전체 고객의 구독 전환 퍼널 단계를 관리합니다.">
        <Link href="/consultations">
          <Button variant="secondary">+ 상담 접수</Button>
        </Link>
        <Button variant="secondary" onClick={() => exportLeadsCsv(filtered)}>
          CSV 다운로드
        </Button>
      </PageTitle>

      {/* 요약 카드 */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <SummaryCard label="전체 리드" value={leads.length} tone="blue" />
        <SummaryCard label="오늘 신규" value={leads.filter((l) => l.receivedDate === todayStr()).length} />
        <SummaryCard label="상담 진행 중" value={countStage("상담 진행 중")} />
        <SummaryCard label="방문 진단 예정" value={countStage("방문 진단 예약")} />
        <SummaryCard label="플랜 제안" value={countStage("정기관리 플랜 제안")} />
        <SummaryCard label="계약 조건 협의" value={countStage("계약 조건 협의")} />
        <SummaryCard label="보류 고객" value={countStage("보류")} tone="amber" />
        <SummaryCard label="계약 완료" value={countStage("구독 계약 완료")} tone="green" />
      </div>

      {/* 필터 + 검색 */}
      <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          <Input type="date" value={f.receivedDate} onChange={(e) => setF({ ...f, receivedDate: e.target.value })} />
          <Select placeholder="현재 단계 전체" options={STAGE_OPTIONS} value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })} />
          <Select placeholder="업종 전체" options={INDUSTRY_OPTIONS} value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })} />
          <Select placeholder="지역 전체" options={REGION_OPTIONS} value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })} />
          <Select placeholder="문제 유형 전체" options={ISSUE_TYPE_OPTIONS} value={f.issueType} onChange={(e) => setF({ ...f, issueType: e.target.value })} />
          <Select placeholder="관리 필요도 전체" options={MANAGEMENT_NEED_OPTIONS} value={f.need} onChange={(e) => setF({ ...f, need: e.target.value })} />
          <Select placeholder="계약 가능성 전체" options={CONTRACT_POSSIBILITY_OPTIONS} value={f.poss} onChange={(e) => setF({ ...f, poss: e.target.value })} />
          <Select placeholder="담당자 전체" options={owners} value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} />
          <Select placeholder="유입 채널 전체" options={channels} value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })} />
          <Input placeholder="상호명/담당자/연락처 검색" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">총 {filtered.length}건 표시</span>
          <Button size="sm" variant="ghost" onClick={() => { setF({ ...EMPTY_FILTERS }); setQ(""); }}>
            필터 초기화
          </Button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : (
          <DataTable columns={columns} rows={filtered} rowKey={(l) => l.leadId} emptyMessage="표시할 리드가 없습니다." />
        )}
      </div>

      {editing && (
        <LeadEditModal
          lead={editing}
          user={user}
          onClose={() => setEditing(null)}
          onSaved={async (msg) => {
            setEditing(null);
            toast.success(msg);
            await load();
          }}
          onWarn={(msg) => toast.info(msg)}
          onError={(msg) => toast.error(msg)}
        />
      )}
    </div>
  );
}

function LeadEditModal({
  lead,
  user,
  onClose,
  onSaved,
  onWarn,
  onError,
}: {
  lead: Lead;
  user: string;
  onClose: () => void;
  onSaved: (msg: string) => void | Promise<void>;
  onWarn: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [form, setForm] = useState({
    currentStage: lead.currentStage,
    managementNeed: lead.managementNeed,
    contractPossibility: lead.contractPossibility,
    owner: lead.owner,
    nextAction: lead.nextAction,
    nextContactDate: lead.nextContactDate,
    note: lead.note,
    status: lead.status,
    holdReason: "내부 검토",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await data.updateLead(
        lead.leadId,
        {
          currentStage: form.currentStage,
          managementNeed: form.managementNeed,
          contractPossibility: form.contractPossibility,
          owner: form.owner,
          nextAction: form.nextAction,
          nextContactDate: form.nextContactDate,
          note: form.note,
          status: form.status,
        },
        user,
        { holdReason: form.holdReason }
      );
      if (res.duplicateHoldWarning) {
        onWarn("이미 미완료 CRM 재접촉이 있어 중복 생성하지 않았습니다.");
      }
      await onSaved(
        res.followUpCreated
          ? "저장되었습니다. 보류 처리되어 CRM 재접촉에 자동 등록되었습니다."
          : "저장되었습니다."
      );
    } catch (e) {
      onError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`리드 수정 · ${lead.storeName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>취소</Button>
          <Button onClick={save} disabled={saving}>{saving ? "저장 중..." : "저장"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Labeled label="현재 단계">
          <Select options={STAGE_OPTIONS} value={form.currentStage} onChange={(e) => setForm({ ...form, currentStage: e.target.value })} />
        </Labeled>
        <Labeled label="상태">
          <Select options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Lead["status"] })} />
        </Labeled>
        <Labeled label="관리 필요도">
          <Select options={MANAGEMENT_NEED_OPTIONS} value={form.managementNeed} onChange={(e) => setForm({ ...form, managementNeed: e.target.value as Lead["managementNeed"] })} />
        </Labeled>
        <Labeled label="계약 가능성">
          <Select options={CONTRACT_POSSIBILITY_OPTIONS} value={form.contractPossibility} onChange={(e) => setForm({ ...form, contractPossibility: e.target.value as Lead["contractPossibility"] })} />
        </Labeled>
        <Labeled label="담당자">
          <Select options={OWNER_OPTIONS} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </Labeled>
        <Labeled label="다음 연락일">
          <Input type="date" value={form.nextContactDate} onChange={(e) => setForm({ ...form, nextContactDate: e.target.value })} />
        </Labeled>
        <Labeled label="다음 액션" className="sm:col-span-2">
          <Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} />
        </Labeled>
        {form.currentStage === "보류" && (
          <Labeled label="보류 사유 (재접촉 자동 등록 시 사용)" className="sm:col-span-2">
            <Select options={HOLD_REASON_OPTIONS} value={form.holdReason} onChange={(e) => setForm({ ...form, holdReason: e.target.value })} />
          </Labeled>
        )}
        <Labeled label="비고" className="sm:col-span-2">
          <Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </Labeled>
      </div>
      <p className="mt-3 text-[11px] text-gray-400">
        저장 시 리드마스터 업데이트 + 리드스냅샷로그 / 데이터변경로그 append, 단계
        변경 시 상태변경이력에도 기록됩니다.
      </p>
    </Modal>
  );
}
