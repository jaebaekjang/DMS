"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Script from "next/script";
import type { PublicSiteConfig } from "@/lib/site/config";
import { LANDING_CSS } from "./styles";

const CARE_NODES = [
  { ico: "🐛", label: "방역 관리" },
  { ico: "🧰", label: "설비 관리" },
  { ico: "🧴", label: "청소 관리" },
  { ico: "🚽", label: "위생 관리" },
  { ico: "❄️", label: "에어컨 관리" },
  { ico: "🧯", label: "현장 점검" },
];

const PROBLEMS = [
  { ico: "🐛", t: "벌레" }, { ico: "💨", t: "냄새" }, { ico: "🍳", t: "후드" },
  { ico: "🚰", t: "배수구" }, { ico: "❄️", t: "에어컨" }, { ico: "🚽", t: "화장실" },
  { ico: "⚙️", t: "설비 문제" },
];

const STEPS = [
  { n: 1, h: "문의 접수", p: "전화, 카카오톡, 네이버톡톡 등으로 매장 문제를 접수합니다." },
  { n: 2, h: "상담·증상 확인", p: "업종, 지역, 평수, 기존 방역 이용 여부 등을 확인하고 방문 필요 여부를 판단합니다." },
  { n: 3, h: "정기관리 플랜 제안", p: "월 관리 범위, 방문 주기, 구독 혜택을 매장 상황에 맞게 제안합니다." },
  { n: 4, h: "구독 계약 및 정기점검", p: "월 비용·방문 주기·포함 범위를 확정한 뒤 정기점검 일정으로 관리가 시작됩니다." },
];

export default function Landing({ config }: { config: PublicSiteConfig }) {
  const { design, popup, tracking, formOptions } = config;
  const [issues, setIssues] = useState<string[]>([]);
  const [issueOpen, setIssueOpen] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind: "" | "ok" | "err" }>({ text: "", kind: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const issueWrapRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const rootStyle = {
    "--brand": design.primaryColor,
    "--brand-dark": design.primaryDark,
    "--bg": design.bgColor,
    "--surface": design.surfaceColor,
    "--text": design.textColor,
    "--muted": design.mutedColor,
  } as CSSProperties;

  useEffect(() => {
    if (!popup.enabled) return;
    const key = "dms_popup_hidden_until";
    const until = parseInt(localStorage.getItem(key) || "0", 10);
    if (Date.now() > until) setShowPopup(true);
  }, [popup.enabled]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (issueWrapRef.current && !issueWrapRef.current.contains(e.target as Node)) {
        setIssueOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function scrollToInquiry() {
    document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleIssue(v: string) {
    setIssues((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  const issueLabel =
    issues.length === 0
      ? "현재 문제를 선택해주세요"
      : issues.length > 2
      ? `${issues.slice(0, 2).join(", ")} 외 ${issues.length - 2}건`
      : issues.join(", ");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("phone") || "").trim();
    const storeName = String(fd.get("storeName") || "").trim();
    if (!storeName) return setMsg({ text: "매장명을 입력해주세요.", kind: "err" });
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) return setMsg({ text: "연락처를 정확히 입력해주세요.", kind: "err" });

    const payload = {
      storeName,
      phone,
      region: String(fd.get("region") || ""),
      industry: String(fd.get("industry") || ""),
      size: String(fd.get("size") || ""),
      message: String(fd.get("message") || "").trim(),
      company: String(fd.get("company") || ""),
      sourceUrl: typeof location !== "undefined" ? location.href : "",
      issues,
    };

    setSubmitting(true);
    setMsg({ text: "접수 중입니다...", kind: "" });
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMsg({ text: data.message || "상담 신청이 접수되었습니다.", kind: "ok" });
        formRef.current?.reset();
        setIssues([]);
        type W = { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
        (window as W).gtag?.("event", "generate_lead", { source: "landing_form" });
        (window as W).fbq?.("track", "Lead");
      } else {
        setMsg({ text: data.message || "접수에 실패했습니다.", kind: "err" });
      }
    } catch {
      setMsg({ text: "네트워크 오류로 접수에 실패했습니다.", kind: "err" });
    } finally {
      setSubmitting(false);
    }
  }

  function hidePopupToday() {
    localStorage.setItem("dms_popup_hidden_until", String(Date.now() + popup.hideForDays * 86400000));
    setShowPopup(false);
  }

  return (
    <div className="dms-landing" style={rootStyle}>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />

      {/* GA4 */}
      {tracking.ga4MeasurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${tracking.ga4MeasurementId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${tracking.ga4MeasurementId}');
          `}</Script>
        </>
      )}
      {/* Meta Pixel */}
      {tracking.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${tracking.metaPixelId}');fbq('track','PageView');
        `}</Script>
      )}

      {/* Hero */}
      <header className="hero">
        <div className="container hero-grid">
          <div>
            <h1>{design.heroTitle}</h1>
            <p className="lead">{design.heroSubtitle}</p>
            <div className="hero-badges">
              <div className="hero-badge"><span className="ico">⏱️</span><div><b>24시간 내 대응</b><span>신속한 현장 대응</span></div></div>
              <div className="hero-badge"><span className="ico">🚚</span><div><b>긴급 출동</b><span>긴급 상황 즉시 지원</span></div></div>
              <div className="hero-badge"><span className="ico">🛡️</span><div><b>책임 관리</b><span>전문가의 체계적 관리</span></div></div>
            </div>
          </div>
          <div>
            <div className="care-ring">
              <div className="core"><b>{design.brandName}</b><span>Total Care</span></div>
              {CARE_NODES.map((n, i) => (
                <div key={i} className={`care-node n${i}`}><div className="ico">{n.ico}</div><small>{n.label}</small></div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 문제 */}
      <section className="section problems">
        <div className="container center">
          <h2>매장 운영 중 <span className="point">이런 문제</span>로 고민이신가요?</h2>
          <div className="problem-list">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="problem"><div className="ico">{p.ico}</div><div>{p.t}</div></div>
            ))}
          </div>
          <div className="callout">
            <span className="point">{design.brandName}</span>는 방역·설비·청소를 한 번에 관리하는 <span className="point">월 구독 서비스</span>입니다.
          </div>
        </div>
      </section>

      {/* 절차 */}
      <section className="section">
        <div className="container center">
          <h2><span className="point">{design.brandName}</span> 월 구독 관리 절차</h2>
          <p style={{ color: "var(--muted)" }}>문의부터 첫 정기점검까지, 매장 상황에 맞는 관리 플랜을 안내합니다.</p>
          <div className="steps" style={{ textAlign: "left" }}>
            {STEPS.map((s) => (
              <div key={s.n} className="step"><div className="num">{s.n}</div><h3>{s.h}</h3><p>{s.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* 상품 */}
      <section className="section problems">
        <div className="container">
          <div className="plans">
            <div className="plan intro">
              <h3 className="brand-name">{design.brandName}</h3>
              <h3 style={{ fontSize: 18, marginTop: -6 }}>월 구독 관리 상품</h3>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>매장 규모와 상황에 맞는 관리 플랜을 선택하세요.</p>
            </div>
            <div className="plan">
              <span className="tag">Premium</span>
              <h3>프리미엄</h3>
              <ul><li>정기 방역 + 설비 + 청소 관리</li><li>정기 방문 및 점검</li><li>문제 발생 시 신속 대응</li><li>월 구독 비용으로 안심 관리</li></ul>
            </div>
            <div className="plan">
              <span className="tag">My Package</span>
              <h3>마이 패키지</h3>
              <ul><li>맞춤 조합형 상품 운영</li><li>맞춤 주기 조정 방문</li><li>선택 서비스 기반 관리</li><li>효율적인 비용 설계</li></ul>
            </div>
          </div>
        </div>
      </section>

      {/* 문의 폼 */}
      <section className="section inquiry" id="inquiry">
        <div className="container">
          <div className="form-title">
            <h2>{design.formTitle}</h2>
            <p>{design.formSubtitle}</p>
          </div>
          <form className="form-card" ref={formRef} onSubmit={onSubmit} autoComplete="on" noValidate>
            <div className="grid-3">
              <div className="field" style={{ marginTop: 0 }}>
                <label>매장명</label>
                <input className="input" type="text" name="storeName" placeholder="예) 맛있는식당" maxLength={100} required />
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label>연락처</label>
                <input className="input" type="tel" name="phone" placeholder="010-1234-5678" maxLength={20} required />
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label>지역</label>
                <select className="select" name="region" defaultValue="">
                  <option value="">지역을 선택해주세요</option>
                  {formOptions.regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>현재 문제 <span className="hint">(드롭다운 / 복수 선택 가능)</span></label>
              <div className="multiselect" ref={issueWrapRef}>
                <div className="input multiselect-toggle" role="button" tabIndex={0}
                     onClick={() => setIssueOpen((o) => !o)}
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIssueOpen((o) => !o); } }}>
                  <span style={{ color: issues.length ? undefined : "#6b6b72" }}>{issueLabel}</span><span>▾</span>
                </div>
                {issueOpen && (
                  <div className="multiselect-panel">
                    {formOptions.issues.map((opt) => (
                      <label key={opt}>
                        <input type="checkbox" checked={issues.includes(opt)} onChange={() => toggleIssue(opt)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="ex"><b>예시</b>벌레/해충, 하수구 막힘 및 역류, 악취, 누수, 화장실 문제, 수도/수전 문제, 후드 청소 및 주방 시설, 바닥 찌든 때 제거, 에어컨 분해 세척, 매장 전체 관리</div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>업종</label>
                <select className="select" name="industry" defaultValue="">
                  <option value="">업종을 선택해주세요</option>
                  {formOptions.industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
                <div className="ex"><b>예시</b>음식점, 요리주점, 카페, 미용실/네일샵/뷰티샵, 편의점/리테일 매장, 기타</div>
              </div>
              <div className="field">
                <label>평수</label>
                <select className="select" name="size" defaultValue="">
                  <option value="">평수를 선택해주세요</option>
                  {formOptions.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="ex"><b>예시</b>10평 미만, 10평 이상~20평 미만, 20평 이상~30평 미만, 30평 이상~50평 미만, 50평 이상</div>
              </div>
            </div>

            <div className="field">
              <label>문의 내용 <span className="hint">(선택)</span></label>
              <textarea className="textarea" name="message" placeholder="매장 상황이나 문의 내용을 입력해주세요." maxLength={2000} />
            </div>

            <div className="honeypot" aria-hidden="true">
              <label>회사명<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>📨 {design.ctaLabel}</button>
            <div className={`form-msg ${msg.kind}`} role="status" aria-live="polite">{msg.text}</div>
            <div className="privacy">🔒 {design.privacyNote}</div>
          </form>
        </div>
      </section>

      <footer className="site-foot">
        <div className="container">© {new Date().getFullYear()} {design.brandName} · 매장 토탈케어 월 구독 서비스</div>
      </footer>

      <button className="floating-cta" onClick={scrollToInquiry}>{design.floatingLabel}</button>

      {showPopup && (
        <div className="dms-popup-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPopup(false); }}>
          <div className="dms-popup-card">
            {popup.imageUrl && <img src={popup.imageUrl} alt="" />}
            <div className="dms-popup-body">
              <h3>{popup.title}</h3>
              <p>{popup.body}</p>
              <div className="dms-popup-actions">
                <a href={popup.linkUrl} onClick={() => setShowPopup(false)}>{popup.buttonLabel}</a>
              </div>
            </div>
            <div className="dms-popup-foot">
              <button type="button" onClick={hidePopupToday}>오늘 하루 보지 않기</button>
              <button type="button" onClick={() => setShowPopup(false)}>닫기 ✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
