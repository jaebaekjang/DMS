"use client";

import { useEffect, useState } from "react";
import AdminShell, { cardCls, fieldCls, btnCls } from "@/components/admin/AdminShell";
import { useAdminConfig } from "@/components/admin/useAdminConfig";
import type { SiteTracking, SiteNotify } from "@/lib/site/config";

type Status = { ga4SecretSet: boolean; metaTokenSet: boolean; messagingSet: boolean; storeMode: string };

export default function IntegrationsPage() {
  const { config, setConfig, loading, saving, saved, save } = useAdminConfig();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/admin/status", { cache: "no-store" }).then((r) => r.json()).then(setStatus).catch(() => {});
  }, []);

  function track<K extends keyof SiteTracking>(key: K, value: SiteTracking[K]) {
    if (!config) return;
    setConfig({ ...config, tracking: { ...config.tracking, [key]: value } });
  }
  function notify<K extends keyof SiteNotify>(key: K, value: SiteNotify[K]) {
    if (!config) return;
    setConfig({ ...config, notify: { ...config.notify, [key]: value } });
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-bold">연동 설정</h1>
      <p className="mb-5 mt-1 text-sm text-[#9a9aa3]">GA4 / Meta / 알림톡·문자 / CRM 웹훅을 연결합니다.</p>
      {saved && <div className="mb-4 rounded-lg border border-[#2f6b46] bg-[#5fd28a]/10 px-4 py-2.5 text-sm text-[#8ee0a8]">저장되었습니다.</div>}

      {loading || !config ? (
        <div className="text-sm text-[#9a9aa3]">불러오는 중...</div>
      ) : (
        <>
          <div className={cardCls}>
            <h2 className="mb-1 text-base font-semibold">광고·분석 (공개 ID)</h2>
            <p className="mb-4 text-xs text-[#9a9aa3]">본래 브라우저에 노출되는 공개 ID 입니다. 비워두면 해당 스크립트는 삽입되지 않습니다.</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="GA4 측정 ID"><input type="text" value={config.tracking.ga4MeasurementId} onChange={(e) => track("ga4MeasurementId", e.target.value)} placeholder="G-XXXXXXXXXX" className={fieldCls} /></Field>
              <Field label="Meta 픽셀 ID"><input type="text" value={config.tracking.metaPixelId} onChange={(e) => track("metaPixelId", e.target.value)} placeholder="1234567890" className={fieldCls} /></Field>
            </div>
            <button className={`${btnCls} mt-2`} disabled={saving} onClick={() => save({ tracking: config.tracking })}>광고·분석 저장</button>
          </div>

          <div className={cardCls}>
            <h2 className="mb-3 text-base font-semibold">알림 · CRM</h2>
            <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={config.notify.alimtalkEnabled} onChange={(e) => notify("alimtalkEnabled", e.target.checked)} className="h-[18px] w-[18px] accent-[#FF7A1A]" />신규 문의 시 카카오 알림톡 발송</label>
            <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={config.notify.smsEnabled} onChange={(e) => notify("smsEnabled", e.target.checked)} className="h-[18px] w-[18px] accent-[#FF7A1A]" />신규 문의 시 문자(SMS) 발송</label>
            <div className="grid grid-cols-2 gap-4">
              <Field label="알림 받을 관리자 번호"><input type="text" value={config.notify.adminPhone} onChange={(e) => notify("adminPhone", e.target.value)} placeholder="01012345678" className={fieldCls} /></Field>
              <Field label="알림톡 템플릿 ID"><input type="text" value={config.notify.alimtalkTemplateId} onChange={(e) => notify("alimtalkTemplateId", e.target.value)} className={fieldCls} /></Field>
            </div>
            <Field label="CRM 웹훅 URL (신규 문의 전달)"><input type="text" value={config.notify.webhookUrl} onChange={(e) => notify("webhookUrl", e.target.value)} placeholder="https://script.google.com/... 또는 CRM 엔드포인트" className={fieldCls} /></Field>
            <button className={btnCls} disabled={saving} onClick={() => save({ notify: config.notify })}>알림·CRM 저장</button>
          </div>

          <div className={cardCls}>
            <h2 className="mb-1 text-base font-semibold">서버 비밀값 상태</h2>
            <p className="mb-3 text-xs text-[#9a9aa3]">API 키·토큰은 보안상 화면에서 입력하지 않고 서버 환경변수로만 관리합니다. 설정 여부만 표시합니다.</p>
            <ul className="space-y-2 text-sm">
              <StatusRow label="GA4 Measurement Protocol (GA4_API_SECRET)" on={status?.ga4SecretSet} />
              <StatusRow label="Meta Conversions API (META_CAPI_TOKEN)" on={status?.metaTokenSet} />
              <StatusRow label="알림톡/문자 발송 (MSG_PROVIDER_URL · MSG_API_KEY)" on={status?.messagingSet} />
              <StatusRow label="문의 영구 저장 (Vercel KV)" on={status?.storeMode === "kv"} />
            </ul>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block text-sm text-[#c4c4cc]">
      <span className="mb-1.5 block font-medium text-[#e7e7ea]">{label}</span>
      {children}
    </label>
  );
}

function StatusRow({ label, on }: { label: string; on?: boolean }) {
  return (
    <li className="flex items-center justify-between border-b border-[#23262f] pb-2">
      <span>{label}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs ${on ? "bg-[#5fd28a]/15 text-[#8ee0a8]" : "bg-[#23262f] text-[#cfcfd6]"}`}>{on ? "설정됨" : "미설정"}</span>
    </li>
  );
}
