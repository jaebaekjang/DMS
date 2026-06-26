"use client";

import { useCallback, useEffect, useState } from "react";
import { data } from "@/client/dataClient";
import { STAGE_OPTIONS } from "@/lib/constants";
import {
  exportArchiveLeadsCsv,
  exportChangeLogCsv,
  exportStageHistoryCsv,
} from "@/lib/export";
import type {
  ArchiveLead,
  DataChangeLog,
  Lead,
  StageHistory,
} from "@/lib/types";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useCurrentUserName } from "@/components/UserContext";
import {
  Badge,
  Button,
  Labeled,
  PageTitle,
  Select,
  cx,
  stageTone,
  statusTone,
  type BadgeTone,
} from "@/components/ui";

type TabKey = "targets" | "archived" | "changelog" | "stages";
const TABS: { key: TabKey; label: string }[] = [
  { key: "targets", label: "아카이브 대상" },
  { key: "archived", label: "아카이브됨" },
  { key: "changelog", label: "데이터변경로그" },
  { key: "stages", label: "상태변경이력" },
];

export default function ArchivePage() {
  const toast = useToast();
  const user = useCurrentUserName();

  const [tab, setTab] = useState<TabKey>("targets");
  const [targets, setTargets] = useState<Lead[]>([]);
  const [archived, setArchived] = useState<ArchiveLead[]>([]);
  const [changelog, setChangelog] = useState<DataChangeLog[]>([]);
  const [stages, setStages] = useState<StageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState<ArchiveLead | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, a, c, s] = await Promise.all([
        data.listArchivableLeads(),
        data.listArchiveLeads(),
        data.listChangeLog(),
        data.listStageHistory(),
      ]);
      setTargets(t);
      setArchived(a);
      setChangelog(c);
      setStages(s);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function archiveOne(leadId: string) {
    setBusy(true);
    try {
      const res = await data.archiveLead(leadId, user);
      toast.success(res.skipped ? "이미 아카이브된 리드입니다." : "아카이브 처리되었습니다.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "아카이브에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function sweep() {
    setBusy(true);
    try {
      const res = await data.runArchiveSweep(user);
      toast.success(`${res.count}건을 아카이브했습니다.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "일괄 아카이브에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const targetCols: Column<Lead>[] = [
    { header: "리드 ID", cell: (l) => <span className="font-mono text-xs text-gray-500">{l.leadId}</span> },
    { header: "상호명", cell: (l) => l.storeName },
    { header: "연락처", cell: (l) => l.phone },
    { header: "현재 단계", cell: (l) => <Badge tone={stageTone(l.currentStage)}>{l.currentStage}</Badge> },
    { header: "상태", cell: (l) => <Badge tone={statusTone(l.status)}>{l.status}</Badge> },
    {
      header: "처리",
      cell: (l) => (
        <Button size="sm" disabled={busy} onClick={() => archiveOne(l.leadId)}>아카이브</Button>
      ),
    },
  ];

  const archivedCols: Column<ArchiveLead>[] = [
    { header: "아카이브 일시", cell: (a) => a.archivedAt },
    { header: "리드 ID", cell: (a) => <span className="font-mono text-xs text-gray-500">{a.leadId}</span> },
    { header: "상호명", cell: (a) => a.storeName },
    { header: "연락처", cell: (a) => a.phone },
    { header: "업종", cell: (a) => a.industry },
    { header: "현재 단계", cell: (a) => <Badge tone={stageTone(a.currentStage)}>{a.currentStage}</Badge> },
    { header: "상태", cell: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge> },
    {
      header: "처리",
      cell: (a) => (
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => setRestoring(a)}>복원</Button>
      ),
    },
  ];

  const changeCols: Column<DataChangeLog>[] = [
    { header: "발생일시", cell: (d) => d.createdAt },
    { header: "실행자", cell: (d) => d.actorName },
    { header: "대상 탭", cell: (d) => d.targetSheet },
    { header: "대상 ID", cell: (d) => <span className="font-mono text-xs text-gray-400">{d.targetId}</span> },
    { header: "리드 ID", cell: (d) => <span className="font-mono text-xs text-gray-400">{d.leadId ?? "-"}</span> },
    { header: "변경 유형", cell: (d) => <Badge tone={changeTone(d.changeType)}>{d.changeType}</Badge> },
    { header: "변경 필드", cell: (d) => d.changedField ?? "-" },
    { header: "변경 전", cell: (d) => d.beforeValue ?? "-" },
    { header: "변경 후", cell: (d) => d.afterValue ?? "-" },
    { header: "메모", cell: (d) => <span className="text-gray-500">{d.memo}</span> },
  ];

  const stageCols: Column<StageHistory>[] = [
    { header: "변경일시", cell: (s) => s.createdAt },
    { header: "리드 ID", cell: (s) => <span className="font-mono text-xs text-gray-400">{s.leadId}</span> },
    { header: "변경자", cell: (s) => s.changedBy },
    { header: "변경 전", cell: (s) => <Badge tone="gray">{s.previousStage || "-"}</Badge> },
    { header: "변경 후", cell: (s) => <Badge tone={stageTone(s.newStage)}>{s.newStage}</Badge> },
    { header: "사유", cell: (s) => s.reason },
    { header: "메모", cell: (s) => <span className="text-gray-500">{s.memo}</span> },
  ];

  return (
    <div>
      <PageTitle title="아카이브 관리" description="계약완료/이탈/종료/삭제됨/비활성 리드를 장기 보관하고 복원합니다.">
        {tab === "targets" && (
          <Button disabled={busy || targets.length === 0} onClick={sweep}>대상 일괄 아카이브</Button>
        )}
        {tab === "archived" && (
          <Button variant="secondary" onClick={() => exportArchiveLeadsCsv(archived)}>아카이브 CSV</Button>
        )}
        {tab === "changelog" && (
          <Button variant="secondary" onClick={() => exportChangeLogCsv(changelog)}>변경로그 CSV</Button>
        )}
        {tab === "stages" && (
          <Button variant="secondary" onClick={() => exportStageHistoryCsv(stages)}>상태이력 CSV</Button>
        )}
      </PageTitle>

      <div className="mb-3 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cx(
              "border-b-2 px-4 py-2 text-sm font-medium",
              tab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t.label}
            <span className="ml-1 text-xs text-gray-400">
              (
              {t.key === "targets"
                ? targets.length
                : t.key === "archived"
                ? archived.length
                : t.key === "changelog"
                ? changelog.length
                : stages.length}
              )
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : tab === "targets" ? (
          <DataTable columns={targetCols} rows={targets} rowKey={(l) => l.leadId} emptyMessage="아카이브 대상 리드가 없습니다." />
        ) : tab === "archived" ? (
          <DataTable columns={archivedCols} rows={archived} rowKey={(a) => a.archiveId} emptyMessage="아카이브된 리드가 없습니다." />
        ) : tab === "changelog" ? (
          <DataTable columns={changeCols} rows={[...changelog].reverse()} rowKey={(d) => d.id} emptyMessage="변경 로그가 없습니다." />
        ) : (
          <DataTable columns={stageCols} rows={[...stages].reverse()} rowKey={(s) => s.id} emptyMessage="상태 변경 이력이 없습니다." />
        )}
      </div>

      {restoring && (
        <RestoreModal
          target={restoring}
          user={user}
          busy={busy}
          onClose={() => setRestoring(null)}
          onDone={async () => {
            setRestoring(null);
            toast.success("리드를 복원했습니다.");
            await load();
          }}
          onError={(m) => toast.error(m)}
          setBusy={setBusy}
        />
      )}
    </div>
  );
}

function RestoreModal({
  target,
  user,
  busy,
  onClose,
  onDone,
  onError,
  setBusy,
}: {
  target: ArchiveLead;
  user: string;
  busy: boolean;
  onClose: () => void;
  onDone: () => void | Promise<void>;
  onError: (m: string) => void;
  setBusy: (b: boolean) => void;
}) {
  const [stage, setStage] = useState("상담 진행 중");

  async function restore() {
    setBusy(true);
    try {
      await data.restoreLead(target.leadId, user, stage);
      await onDone();
    } catch (e) {
      onError(e instanceof Error ? e.message : "복원에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-md"
      title={`리드 복원 · ${target.storeName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>취소</Button>
          <Button onClick={restore} disabled={busy}>{busy ? "복원 중..." : "복원"}</Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-gray-600">
        복원 시 상태가 “활성”으로 변경되고 archived 값이 해제됩니다. 원본
        아카이브 기록은 삭제되지 않습니다.
      </p>
      <Labeled label="복원 후 현재 단계">
        <Select options={STAGE_OPTIONS} value={stage} onChange={(e) => setStage(e.target.value)} />
      </Labeled>
    </Modal>
  );
}

function changeTone(type: string): BadgeTone {
  switch (type) {
    case "CREATE":
    case "CREATE_CONSULTATION":
    case "RESTORE":
      return "green";
    case "UPDATE":
    case "STAGE_CHANGE":
      return "blue";
    case "FOLLOW_UP_CREATE":
    case "FOLLOW_UP_COMPLETE":
      return "amber";
    case "ARCHIVE":
      return "slate";
    case "SOFT_DELETE":
    case "ERROR":
      return "red";
    default:
      return "gray";
  }
}
