"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { data } from "@/client/dataClient";
import {
  CHANNEL_OPTIONS,
  CONSULTATION_RESULT_OPTIONS,
  INDUSTRY_OPTIONS,
  ISSUE_TYPE_OPTIONS,
  MANAGEMENT_NEED_OPTIONS,
  OWNER_OPTIONS,
  REGION_OPTIONS,
  VISIT_DIAGNOSIS_OPTIONS,
} from "@/lib/constants";
import { nowDateTimeStr, todayStr } from "@/lib/dates";
import { exportConsultationsCsv } from "@/lib/export";
import type { Consultation, Lead } from "@/lib/types";
import type { ConsultationInput } from "@/services/crmService";
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
  Textarea,
  stageTone,
} from "@/components/ui";

export default function ConsultationsPage() {
  const toast = useToast();
  const user = useCurrentUserName();

  const [items, setItems] = useState<Consultation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [resultFilter, setResultFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cs, ls] = await Promise.all([
        data.listConsultations(),
        data.listLeads(),
      ]);
      setItems(cs);
      setLeads(ls);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "상담 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = q.trim();
    return items
      .filter((c) => (resultFilter ? c.consultationResult === resultFilter : true))
      .filter((c) =>
        query
          ? [c.storeName, c.contactName, c.phone].some((v) =>
              (v ?? "").includes(query)
            )
          : true
      )
      .sort((a, b) => (a.consultationDateTime < b.consultationDateTime ? 1 : -1));
  }, [items, q, resultFilter]);

  const columns: Column<Consultation>[] = [
    { header: "상담일시", cell: (c) => c.consultationDateTime },
    { header: "채널", cell: (c) => c.channel },
    {
      header: "상호명",
      cell: (c) => (
        <Link
          href={`/customers/${encodeURIComponent(c.leadId)}`}
          className="font-medium text-brand hover:underline"
        >
          {c.storeName}
        </Link>
      ),
    },
    { header: "담당자명", cell: (c) => c.contactName },
    { header: "연락처", cell: (c) => c.phone },
    { header: "문제 유형", cell: (c) => c.issueType },
    {
      header: "고객이 말한 증상",
      cell: (c) => (
        <span className="block max-w-[220px] truncate text-gray-600" title={c.symptomText}>
          {c.symptomText}
        </span>
      ),
    },
    { header: "방문 진단", cell: (c) => c.visitDiagnosisNeeded },
    {
      header: "상담 결과",
      cell: (c) => <Badge tone={stageTone(c.consultationResult)}>{c.consultationResult}</Badge>,
    },
    { header: "담당자", cell: (c) => c.owner },
  ];

  return (
    <div>
      <PageTitle title="상담 접수" description="신규 문의를 등록하고 방문 진단 필요 여부를 판단합니다.">
        <Button variant="secondary" onClick={() => exportConsultationsCsv(filtered)}>
          CSV 다운로드
        </Button>
        <Button onClick={() => setOpen(true)}>+ 신규 상담 등록</Button>
      </PageTitle>

      <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <Select
          placeholder="상담 결과 전체"
          options={CONSULTATION_RESULT_OPTIONS}
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="max-w-[200px]"
        />
        <Input
          placeholder="상호명/담당자/연락처 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-[280px]"
        />
        <span className="ml-auto self-center text-xs text-gray-500">총 {filtered.length}건</span>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : (
          <DataTable columns={columns} rows={filtered} rowKey={(c) => c.id} emptyMessage="등록된 상담이 없습니다." />
        )}
      </div>

      {open && (
        <ConsultationFormModal
          leads={leads}
          user={user}
          onClose={() => setOpen(false)}
          onCreated={async (msg) => {
            setOpen(false);
            toast.success(msg);
            await load();
          }}
          onError={(msg) => toast.error(msg)}
        />
      )}
    </div>
  );
}

const emptyForm: ConsultationInput = {
  consultationDateTime: "",
  channel: "전화",
  storeName: "",
  contactName: "",
  phone: "",
  industry: "카페",
  region: "서울",
  issueType: "벌레",
  symptomText: "",
  storeSize: "",
  managementNeed: "중간",
  photoRequested: false,
  photoReceived: false,
  visitDiagnosisNeeded: "판단 보류",
  consultationResult: "추가 상담 필요",
  nextAction: "",
  nextContactDate: "",
  memo: "",
  owner: OWNER_OPTIONS[0],
};

function ConsultationFormModal({
  leads,
  user,
  onClose,
  onCreated,
  onError,
}: {
  leads: Lead[];
  user: string;
  onClose: () => void;
  onCreated: (msg: string) => void | Promise<void>;
  onError: (msg: string) => void;
}) {
  const [form, setForm] = useState<ConsultationInput>({
    ...emptyForm,
    consultationDateTime: nowDateTimeStr(),
  });
  const [saving, setSaving] = useState(false);
  const [dupLead, setDupLead] = useState<Lead | null>(null);

  const set = <K extends keyof ConsultationInput>(
    key: K,
    value: ConsultationInput[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(mode: "new" | "attach", existingLeadId?: string) {
    if (!form.storeName.trim() || !form.phone.trim()) {
      onError("상호명과 연락처는 필수입니다.");
      return;
    }
    setSaving(true);
    try {
      const res = await data.createConsultation(form, user, {
        mode,
        existingLeadId,
      });
      const base =
        mode === "attach"
          ? `기존 리드(${res.lead.storeName})에 상담 이력을 추가했습니다.`
          : `신규 리드(${res.lead.leadId})가 생성되었습니다.`;
      await onCreated(
        res.followUpCreated ? `${base} 보류 처리되어 CRM 재접촉에 등록되었습니다.` : base
      );
    } catch (e) {
      onError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      setSaving(false);
    }
  }

  function handleSaveClick() {
    if (!form.storeName.trim() || !form.phone.trim()) {
      onError("상호명과 연락처는 필수입니다.");
      return;
    }
    const dup = leads.find((l) => l.phone && l.phone === form.phone.trim());
    if (dup) {
      setDupLead(dup);
      return;
    }
    submit("new");
  }

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-3xl"
      title="신규 상담 등록"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>취소</Button>
          <Button onClick={handleSaveClick} disabled={saving}>{saving ? "저장 중..." : "저장"}</Button>
        </>
      }
    >
      <FormSection title="기본 정보">
        <Labeled label="접수일시">
          <Input value={form.consultationDateTime} onChange={(e) => set("consultationDateTime", e.target.value)} />
        </Labeled>
        <Labeled label="상담 채널">
          <Select options={CHANNEL_OPTIONS} value={form.channel} onChange={(e) => set("channel", e.target.value)} />
        </Labeled>
        <Labeled label="상호명" required>
          <Input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
        </Labeled>
        <Labeled label="담당자명">
          <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
        </Labeled>
        <Labeled label="연락처" required>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-0000-0000" />
        </Labeled>
        <Labeled label="업종">
          <Select options={INDUSTRY_OPTIONS} value={form.industry} onChange={(e) => set("industry", e.target.value)} />
        </Labeled>
        <Labeled label="지역">
          <Select options={REGION_OPTIONS} value={form.region} onChange={(e) => set("region", e.target.value)} />
        </Labeled>
      </FormSection>

      <FormSection title="문제 정보">
        <Labeled label="문제 유형">
          <Select options={ISSUE_TYPE_OPTIONS} value={form.issueType} onChange={(e) => set("issueType", e.target.value)} />
        </Labeled>
        <Labeled label="평수">
          <Input value={form.storeSize} onChange={(e) => set("storeSize", e.target.value)} placeholder="예: 30평" />
        </Labeled>
        <Labeled label="관리 필요도">
          <Select options={MANAGEMENT_NEED_OPTIONS} value={form.managementNeed} onChange={(e) => set("managementNeed", e.target.value as ConsultationInput["managementNeed"])} />
        </Labeled>
        <Labeled label="방문 진단 필요 여부">
          <Select options={VISIT_DIAGNOSIS_OPTIONS} value={form.visitDiagnosisNeeded} onChange={(e) => set("visitDiagnosisNeeded", e.target.value as ConsultationInput["visitDiagnosisNeeded"])} />
        </Labeled>
        <Labeled label="고객이 말한 증상" className="sm:col-span-2">
          <Textarea rows={2} value={form.symptomText} onChange={(e) => set("symptomText", e.target.value)} />
        </Labeled>
        <div className="flex items-center gap-4 sm:col-span-2">
          <Checkbox label="사진 요청 여부" checked={form.photoRequested} onChange={(v) => set("photoRequested", v)} />
          <Checkbox label="사진 수신 여부" checked={form.photoReceived} onChange={(v) => set("photoReceived", v)} />
        </div>
      </FormSection>

      <FormSection title="상담 결과">
        <Labeled label="상담 결과">
          <Select options={CONSULTATION_RESULT_OPTIONS} value={form.consultationResult} onChange={(e) => set("consultationResult", e.target.value)} />
        </Labeled>
        <Labeled label="담당자">
          <Select options={OWNER_OPTIONS} value={form.owner} onChange={(e) => set("owner", e.target.value)} />
        </Labeled>
        <Labeled label="다음 액션">
          <Input value={form.nextAction} onChange={(e) => set("nextAction", e.target.value)} />
        </Labeled>
        <Labeled label="다음 연락일">
          <Input type="date" value={form.nextContactDate} onChange={(e) => set("nextContactDate", e.target.value)} min={todayStr()} />
        </Labeled>
        <Labeled label="상담 메모" className="sm:col-span-2">
          <Textarea rows={2} value={form.memo} onChange={(e) => set("memo", e.target.value)} />
        </Labeled>
      </FormSection>

      <p className="mt-1 text-[11px] text-gray-400">
        저장 시 상담접수 / 상담원본로그 / 리드마스터 / 리드스냅샷로그 /
        데이터변경로그 / 상태변경이력에 동시에 기록됩니다. 상담 결과에 따라 현재
        단계가 자동 매핑됩니다.
      </p>

      {/* 중복 연락처 확인 */}
      {dupLead && (
        <Modal
          open
          onClose={() => setDupLead(null)}
          width="max-w-md"
          title="동일 연락처 확인"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDupLead(null)} disabled={saving}>
                취소
              </Button>
              <Button
                variant="secondary"
                onClick={() => submit("attach", dupLead.leadId)}
                disabled={saving}
              >
                기존 리드에 이력 추가
              </Button>
              <Button onClick={() => submit("new")} disabled={saving}>
                신규 리드로 등록
              </Button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            동일 연락처의 리드가 이미 존재합니다. 기존 리드에 상담 이력으로
            추가할까요, 아니면 신규 리드로 등록할까요?
          </p>
          <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm">
            <div className="font-medium text-gray-800">{dupLead.storeName}</div>
            <div className="text-gray-500">
              {dupLead.leadId} · {dupLead.phone} · {dupLead.currentStage}
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
      />
      {label}
    </label>
  );
}
