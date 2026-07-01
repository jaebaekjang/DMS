"use client";

import AdminShell, { cardCls, fieldCls, btnCls } from "@/components/admin/AdminShell";
import { useAdminConfig } from "@/components/admin/useAdminConfig";
import type { SitePopup } from "@/lib/site/config";

export default function PopupPage() {
  const { config, setConfig, loading, saving, saved, save } = useAdminConfig();

  function update<K extends keyof SitePopup>(key: K, value: SitePopup[K]) {
    if (!config) return;
    setConfig({ ...config, popup: { ...config.popup, [key]: value } });
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-bold">팝업 설정</h1>
      <p className="mb-5 mt-1 text-sm text-[#9a9aa3]">랜딩페이지 진입 시 노출되는 공지/이벤트 팝업을 설정합니다.</p>
      {saved && <div className="mb-4 rounded-lg border border-[#2f6b46] bg-[#5fd28a]/10 px-4 py-2.5 text-sm text-[#8ee0a8]">저장되었습니다.</div>}

      {loading || !config ? (
        <div className="text-sm text-[#9a9aa3]">불러오는 중...</div>
      ) : (
        <>
          <div className={cardCls}>
            <label className="mb-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config.popup.enabled} onChange={(e) => update("enabled", e.target.checked)} className="h-[18px] w-[18px] accent-[#FF7A1A]" />
              팝업 사용
            </label>
            <Field label="제목"><input type="text" value={config.popup.title} onChange={(e) => update("title", e.target.value)} className={fieldCls} /></Field>
            <Field label="내용"><textarea value={config.popup.body} onChange={(e) => update("body", e.target.value)} className={`${fieldCls} min-h-[70px]`} /></Field>
            <Field label="이미지 URL (선택)"><input type="text" value={config.popup.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." className={fieldCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="버튼 문구"><input type="text" value={config.popup.buttonLabel} onChange={(e) => update("buttonLabel", e.target.value)} className={fieldCls} /></Field>
              <Field label="버튼 링크"><input type="text" value={config.popup.linkUrl} onChange={(e) => update("linkUrl", e.target.value)} placeholder="#inquiry 또는 https://..." className={fieldCls} /></Field>
            </div>
            <div className="max-w-[240px]">
              <Field label={'"오늘 하루 보지 않기" 일수'}>
                <input type="number" min={0} max={30} value={config.popup.hideForDays} onChange={(e) => update("hideForDays", Number(e.target.value))} className={fieldCls} />
              </Field>
            </div>
          </div>
          <button className={btnCls} disabled={saving} onClick={() => save({ popup: config.popup })}>
            {saving ? "저장 중..." : "저장"}
          </button>
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
