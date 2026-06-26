"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { data } from "@/client/dataClient";
import {
  CUSTOMER_STATUS_OPTIONS,
  FOLLOW_UP_TYPE_OPTIONS,
  HOLD_REASON_OPTIONS,
  ISSUE_TYPE_OPTIONS,
  OWNER_OPTIONS,
} from "@/lib/constants";
import { isOnOrBeforeToday, todayStr } from "@/lib/dates";
import { exportFollowUpsCsv } from "@/lib/export";
import type { FollowUp, Lead } from "@/lib/types";
import type { FollowUpInput } from "@/services/crmService";
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
} from "@/components/ui";

const EMPTY_FILTERS = {
  scheduledDate: "",
  followUpType: "",
  customerStatus: "",
  holdReason: "",
  owner: "",
  issueType: "",
};

export default function FollowUpsPage() {
  const toast = useToast();
  const user = useCurrentUserName();

  const [items, setItems] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ ...EMPTY_FILTERS });
  const [todayOnly, setTodayOnly] = useState(false);
  const [completing, setCompleting] = useState<FollowUp | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fu, ls] = await Promise.all([
        data.listFollowUps(),
        data.listLeads(),
      ]);
      setItems(fu);
      setLeads(ls);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "재접촉 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const overdue = (x: FollowUp) =>
    !x.completed && isOnOrBeforeToday(x.scheduledDate);

  const filtered = useMemo(() => {
    return items
      .filter((x) => (todayOnly ? overdue(x) : true))
      .filter((x) => (f.scheduledDate ? x.scheduledDate === f.scheduledDate : true))
      .filter((x) => (f.followUpType ? x.followUpType === f.followUpType : true))
      .filter((x) => (f.customerStatus ? x.customerStatus === f.customerStatus : true))
      .filter((x) => (f.holdReason ? x.holdReason === f.holdReason : true))
      .filter((x) => (f.owner ? x.owner === f.owner : true))
      .filter((x) => (f.issueType ? x.issueType === f.issueType : true))
      .sort((a, b) => (a.scheduledDate < b.scheduledDate ? -1 : 1));
  }, [items, f, todayOnly]);

  const cToday = items.filter((x) => !x.completed && x.scheduledDate === todayStr()).length;
  const cOverdue = items.filter((x) => !x.completed && x.scheduledDate < todayStr()).length;
  const cType = (t: string) => items.filter((x) => !x.completed && x.followUpType === t).length;
  const cStatus = (s: string) => items.filter((x) => x.customerStatus === s).length;

  const columns: Column<FollowUp>[] = [
    { header: "재접촉 ID", cell: (x) => <span className="font-mono text-xs text-gray-400">{x.id.slice(-6)}</span> },
    { header: "리드 ID", cell: (x) => <span className="font-mono text-xs text-gray-500">{x.leadId}</span> },
    {
      header: "상호명",
      cell: (x) => (
        <Link href={`/customers/${encodeURIComponent(x.leadId)}`} className="font-medium text-brand hover:underline">
          {x.storeName}
        </Link>
      ),
    },
    { header: "담당자명", cell: (x) => x.contactName },
    { header: "연락처", cell: (x) => x.phone },
    { header: "문제 유형", cell: (x) => x.issueType },
    { header: "보류 발생일", cell: (x) => x.holdDate },
    { header: "보류 사유", cell: (x) => x.holdReason },
    { header: "재접촉 구분", cell: (x) => <Badge tone="blue">{x.followUpType}</Badge> },
    {
      header: "재접촉 예정일",
      cell: (x) =>
        overdue(x) ? (
          <span className="font-semibold text-red-600">{x.scheduledDate}</span>
        ) : (
          x.scheduledDate
        ),
    },
    {
      header: "완료 여부",
      cell: (x) =>
        x.completed ? <Badge tone="green">완료</Badge> : <Badge tone="amber">미완료</Badge>,
    },
    { header: "완료일", cell: (x) => x.completedDate ?? "-" },
    { header: "고객 상태", cell: (x) => x.customerStatus },
    { header: "재제안 내용", cell: (x) => <span className="text-gray-600">{x.proposalMessage}</span> },
    { header: "다음 액션", cell: (x) => x.nextAction },
    { header: "담당자", cell: (x) => x.owner },
    { header: "메모", cell: (x) => <span className="text-gray-500">{x.memo}</span> },
    {
      header: "처리",
      cell: (x) =>
        x.completed ? (
          <span className="text-xs text-gray-400">완료됨</span>
        ) : (
          <Button size="sm" onClick={() => setCompleting(x)}>완료 처리</Button>
        ),
    },
  ];

  return (
    <div>
      <PageTitle title="CRM 재접촉" description="보류 고객을 3일·14일·30일 기준으로 재접촉합니다.">
        <Button variant="secondary" onClick={() => setManualOpen(true)}>+ 수동 재접촉</Button>
        <Button variant="secondary" onClick={() => exportFollowUpsCsv(filtered)}>CSV 다운로드</Button>
      </PageTitle>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <SummaryCard label="오늘 재접촉 대상" value={cToday} tone="blue" />
        <SummaryCard label="지연된 재접촉" value={cOverdue} tone="red" />
        <SummaryCard label="3일 후 대상" value={cType("3일 후")} />
        <SummaryCard label="14일 후 대상" value={cType("14일 후")} />
        <SummaryCard label="30일 후 대상" value={cType("30일 후")} />
        <SummaryCard label="계약 재검토" value={cStatus("계약 검토")} tone="green" />
        <SummaryCard label="종료 고객" value={cStatus("종료")} tone="gray" />
      </div>

      <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <Input type="date" value={f.scheduledDate} onChange={(e) => setF({ ...f, scheduledDate: e.target.value })} />
          <Select placeholder="재접촉 구분 전체" options={FOLLOW_UP_TYPE_OPTIONS} value={f.followUpType} onChange={(e) => setF({ ...f, followUpType: e.target.value })} />
          <Select placeholder="고객 상태 전체" options={CUSTOMER_STATUS_OPTIONS} value={f.customerStatus} onChange={(e) => setF({ ...f, customerStatus: e.target.value })} />
          <Select placeholder="보류 사유 전체" options={HOLD_REASON_OPTIONS} value={f.holdReason} onChange={(e) => setF({ ...f, holdReason: e.target.value })} />
          <Select placeholder="담당자 전체" options={OWNER_OPTIONS} value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} />
          <Select placeholder="문제 유형 전체" options={ISSUE_TYPE_OPTIONS} value={f.issueType} onChange={(e) => setF({ ...f, issueType: e.target.value })} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={todayOnly}
              onChange={(e) => setTodayOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            오늘 할 일만 보기 (예정일 ≤ 오늘 · 미완료)
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">총 {filtered.length}건</span>
            <Button size="sm" variant="ghost" onClick={() => { setF({ ...EMPTY_FILTERS }); setTodayOnly(false); }}>
              필터 초기화
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : (
          <DataTable columns={columns} rows={filtered} rowKey={(x) => x.id} emptyMessage="표시할 재접촉이 없습니다." />
        )}
      </div>

      {completing && (
        <CompleteModal
          followUp={completing}
          user={user}
          onClose={() => setCompleting(null)}
          onDone={async (msg) => {
            setCompleting(null);
            toast.success(msg);
            await load();
          }}
          onError={(msg) => toast.error(msg)}
        />
      )}

      {manualOpen && (
        <ManualFollowUpModal
          leads={leads}
          user={user}
          onClose={() => setManualOpen(false)}
          onDone={async (msg) => {
            setManualOpen(false);
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

function CompleteModal({
  followUp,
  user,
  onClose,
  onDone,
  onError,
}: {
  followUp: FollowUp;
  user: string;
  onClose: () => void;
  onDone: (msg: string) => void | Promise<void>;
  onError: (msg: string) => void;
}) {
  const [customerStatus, setCustomerStatus] = useState("관심 유지");
  const [proposalMessage, setProposalMessage] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [memo, setMemo] = useState("");
  const [completedDate, setCompletedDate] = useState(todayStr());
  const [createNext, setCreateNext] = useState(true);
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    try {
      const res = await data.completeFollowUp(
        followUp.id,
        { customerStatus, proposalMessage, nextAction, memo, completedDate },
        user,
        { createNext: createNext && customerStatus === "관심 유지" }
      );
      const parts = ["재접촉을 완료 처리했습니다."];
      if (res.leadStageUpdated) parts.push("리드 현재 단계가 업데이트되었습니다.");
      if (res.nextFollowUpCreated) parts.push("다음 재접촉 일정이 생성되었습니다.");
      await onDone(parts.join(" "));
    } catch (e) {
      onError(e instanceof Error ? e.message : "완료 처리에 실패했습니다.");
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`재접촉 완료 · ${followUp.storeName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>취소</Button>
          <Button variant="success" onClick={confirm} disabled={saving}>{saving ? "처리 중..." : "완료 처리"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Labeled label="고객 상태 (사람이 직접 선택)">
          <Select options={CUSTOMER_STATUS_OPTIONS} value={customerStatus} onChange={(e) => setCustomerStatus(e.target.value)} />
        </Labeled>
        <Labeled label="완료일">
          <Input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} />
        </Labeled>
        <Labeled label="다음 액션" className="sm:col-span-2">
          <Input value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
        </Labeled>
        <Labeled label="재제안 내용" className="sm:col-span-2">
          <Textarea rows={2} value={proposalMessage} onChange={(e) => setProposalMessage(e.target.value)} />
        </Labeled>
        <Labeled label="메모" className="sm:col-span-2">
          <Textarea rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} />
        </Labeled>
      </div>

      {customerStatus === "관심 유지" && (
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={createNext}
            onChange={(e) => setCreateNext(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
          />
          다음 재접촉 일정 자동 생성 ({followUp.followUpType} → 다음 단계)
        </label>
      )}

      <p className="mt-3 text-[11px] text-gray-400">
        완료 시 CRM재접촉 업데이트 + CRM재접촉로그 / 데이터변경로그 append. 고객
        상태에 따라 리드 현재 단계가 자동 변경됩니다.
      </p>
    </Modal>
  );
}

function ManualFollowUpModal({
  leads,
  user,
  onClose,
  onDone,
  onWarn,
  onError,
}: {
  leads: Lead[];
  user: string;
  onClose: () => void;
  onDone: (msg: string) => void | Promise<void>;
  onWarn: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const selectable = leads.filter((l) => !l.archived);
  const [leadId, setLeadId] = useState(selectable[0]?.leadId ?? "");
  const [followUpType, setFollowUpType] = useState<FollowUp["followUpType"]>("수동 재접촉");
  const [holdReason, setHoldReason] = useState(HOLD_REASON_OPTIONS[0]);
  const [scheduledDate, setScheduledDate] = useState(todayStr());
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    const lead = leads.find((l) => l.leadId === leadId);
    if (!lead) {
      onError("리드를 선택해주세요.");
      return;
    }
    setSaving(true);
    try {
      const input: FollowUpInput = {
        leadId: lead.leadId,
        storeName: lead.storeName,
        contactName: lead.contactName,
        phone: lead.phone,
        issueType: lead.issueType,
        holdReason,
        followUpType,
        scheduledDate,
        owner: lead.owner,
        memo,
      };
      const res = await data.createFollowUp(input, user);
      if (res.duplicateWarning) {
        onWarn("이미 미완료 재접촉이 있어 중복 생성하지 않았습니다.");
        setSaving(false);
        return;
      }
      await onDone("수동 재접촉이 등록되었습니다.");
    } catch (e) {
      onError(e instanceof Error ? e.message : "등록에 실패했습니다.");
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="수동 재접촉 등록"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>취소</Button>
          <Button onClick={save} disabled={saving}>{saving ? "등록 중..." : "등록"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Labeled label="대상 리드" className="sm:col-span-2">
          <Select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            {selectable.map((l) => (
              <option key={l.leadId} value={l.leadId}>
                {l.storeName} ({l.leadId}) · {l.phone}
              </option>
            ))}
          </Select>
        </Labeled>
        <Labeled label="재접촉 구분">
          <Select options={FOLLOW_UP_TYPE_OPTIONS} value={followUpType} onChange={(e) => setFollowUpType(e.target.value as FollowUp["followUpType"])} />
        </Labeled>
        <Labeled label="재접촉 예정일">
          <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </Labeled>
        <Labeled label="보류 사유">
          <Select options={HOLD_REASON_OPTIONS} value={holdReason} onChange={(e) => setHoldReason(e.target.value)} />
        </Labeled>
        <Labeled label="메모">
          <Input value={memo} onChange={(e) => setMemo(e.target.value)} />
        </Labeled>
      </div>
    </Modal>
  );
}
