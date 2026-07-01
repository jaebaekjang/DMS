"use client";

import AdminShell, { cardCls, fieldCls, btnCls } from "@/components/admin/AdminShell";
import { useAdminConfig } from "@/components/admin/useAdminConfig";
import type { SiteDesign } from "@/lib/site/config";

const COLORS: { key: keyof SiteDesign; label: string }[] = [
  { key: "primaryColor", label: "포인트(주황)" },
  { key: "primaryDark", label: "포인트 진한색" },
  { key: "bgColor", label: "배경(블랙)" },
  { key: "surfaceColor", label: "카드 표면" },
  { key: "textColor", label: "본문 텍스트" },
  { key: "mutedColor", label: "보조 텍스트" },
];

const TEXTS: { key: keyof SiteDesign; label: string; area?: boolean }[] = [
  { key: "brandName", label: "브랜드명" },
  { key: "heroTitle", label: "히어로 제목", area: true },
  { key: "heroSubtitle", label: "히어로 소제목", area: true },
  { key: "formTitle", label: "폼 제목" },
  { key: "ctaLabel", label: "신청 버튼 문구" },
  { key: "formSubtitle", label: "폼 소제목", area: true },
  { key: "floatingLabel", label: "플로팅 버튼 문구" },
  { key: "privacyNote", label: "개인정보 안내 문구" },
];

export default function DesignPage() {
  const { config, setConfig, loading, saving, saved, save } = useAdminConfig();

  function update(key: keyof SiteDesign, value: string) {
    if (!config) return;
    setConfig({ ...config, design: { ...config.design, [key]: value } });
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-bold">디자인 수정</h1>
      <p className="mb-5 mt-1 text-sm text-[#9a9aa3]">랜딩페이지의 색상(블랙/주황)과 문구를 변경합니다.</p>
      {saved && <div className="mb-4 rounded-lg border border-[#2f6b46] bg-[#5fd28a]/10 px-4 py-2.5 text-sm text-[#8ee0a8]">저장되었습니다.</div>}

      {loading || !config ? (
        <div className="text-sm text-[#9a9aa3]">불러오는 중...</div>
      ) : (
        <>
          <div className={cardCls}>
            <h2 className="mb-4 text-base font-semibold">색상</h2>
            <div className="grid grid-cols-2 gap-4">
              {COLORS.map((c) => (
                <label key={c.key} className="block text-sm text-[#c4c4cc]">
                  <span className="mb-1.5 block font-medium text-[#e7e7ea]">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={String(config.design[c.key])} onChange={(e) => update(c.key, e.target.value)} className="h-9 w-11 rounded border border-[#2a2d36] bg-[#0f1115]" />
                    <input type="text" value={String(config.design[c.key])} onChange={(e) => update(c.key, e.target.value)} className={fieldCls} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={cardCls}>
            <h2 className="mb-4 text-base font-semibold">문구</h2>
            {TEXTS.map((t) => (
              <label key={t.key} className="mb-3 block text-sm text-[#c4c4cc]">
                <span className="mb-1.5 block font-medium text-[#e7e7ea]">{t.label}</span>
                {t.area ? (
                  <textarea value={String(config.design[t.key])} onChange={(e) => update(t.key, e.target.value)} className={`${fieldCls} min-h-[70px]`} />
                ) : (
                  <input type="text" value={String(config.design[t.key])} onChange={(e) => update(t.key, e.target.value)} className={fieldCls} />
                )}
              </label>
            ))}
          </div>

          <button className={btnCls} disabled={saving} onClick={() => save({ design: config.design })}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </>
      )}
    </AdminShell>
  );
}
