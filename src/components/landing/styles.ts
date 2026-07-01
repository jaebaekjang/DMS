// 랜딩 전용 CSS. Landing 컴포넌트가 마운트된 동안에만 <style> 로 주입되므로
// CRM 페이지(다른 라우트)에는 영향을 주지 않는다. 색상 변수는 config 에서 인라인 주입.
export const LANDING_CSS = `
.dms-landing * { box-sizing: border-box; }
.dms-landing {
  --line: rgba(255,255,255,0.10);
  --radius: 16px;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  font-family: "Pretendard", system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif;
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
}
.dms-landing img { max-width: 100%; display: block; }
.dms-landing .container { width: min(1040px, 92%); margin: 0 auto; }
.dms-landing .section { padding: 72px 0; }
.dms-landing .point { color: var(--brand); }
.dms-landing .center { text-align: center; }
.dms-landing h1, .dms-landing h2, .dms-landing h3 { letter-spacing: -0.01em; }

.dms-landing .hero {
  position: relative; padding: 96px 0 64px;
  background: radial-gradient(900px 460px at 78% 12%, rgba(255,122,26,0.18), transparent 60%), linear-gradient(180deg, #0E0E12 0%, var(--bg) 100%);
  border-bottom: 1px solid var(--line);
}
.dms-landing .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; }
.dms-landing .hero h1 { font-size: clamp(28px, 4.4vw, 46px); line-height: 1.25; font-weight: 800; margin: 0 0 18px; }
.dms-landing .hero p.lead { font-size: clamp(15px, 1.8vw, 18px); color: var(--muted); margin: 0 0 28px; }
.dms-landing .hero-badges { display: flex; flex-wrap: wrap; gap: 14px; }
.dms-landing .hero-badge { display: flex; gap: 10px; align-items: flex-start; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; }
.dms-landing .hero-badge .ico { font-size: 20px; }
.dms-landing .hero-badge b { display: block; font-size: 13px; }
.dms-landing .hero-badge span { font-size: 12px; color: var(--muted); }

.dms-landing .care-ring { position: relative; width: 320px; height: 320px; margin: 0 auto; }
.dms-landing .care-ring .core { position: absolute; inset: 50% auto auto 50%; transform: translate(-50%, -50%); width: 150px; height: 150px; border-radius: 50%; display: grid; place-content: center; text-align: center; background: radial-gradient(circle, rgba(255,122,26,0.16), transparent 70%); border: 1px solid var(--brand); }
.dms-landing .care-ring .core b { font-size: 26px; font-weight: 800; }
.dms-landing .care-ring .core span { font-size: 13px; color: var(--brand); font-weight: 700; }
.dms-landing .care-node { position: absolute; width: 92px; height: 92px; border-radius: 50%; background: var(--surface); border: 1px solid var(--brand); display: grid; place-content: center; text-align: center; left: 50%; top: 50%; margin: -46px 0 0 -46px; }
.dms-landing .care-node .ico { font-size: 22px; }
.dms-landing .care-node small { font-size: 11px; color: var(--muted); }
.dms-landing .care-node.n0 { transform: translate(0, -132px); }
.dms-landing .care-node.n1 { transform: translate(118px, -66px); }
.dms-landing .care-node.n2 { transform: translate(118px, 66px); }
.dms-landing .care-node.n3 { transform: translate(0, 132px); }
.dms-landing .care-node.n4 { transform: translate(-118px, 66px); }
.dms-landing .care-node.n5 { transform: translate(-118px, -66px); }

.dms-landing .problems { background: linear-gradient(180deg, #101014, var(--bg)); }
.dms-landing .problem-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 24px; margin-top: 28px; }
.dms-landing .problem { text-align: center; min-width: 72px; }
.dms-landing .problem .ico { font-size: 30px; }
.dms-landing .problem div { font-size: 13px; color: var(--muted); margin-top: 6px; }
.dms-landing .callout { margin: 36px auto 0; max-width: 640px; text-align: center; border: 1px solid var(--brand); border-radius: var(--radius); padding: 22px; font-size: 18px; font-weight: 700; background: rgba(255,122,26,0.06); }

.dms-landing .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 36px; }
.dms-landing .step { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 22px 18px; }
.dms-landing .step .num { width: 30px; height: 30px; border-radius: 50%; background: var(--brand); color: #1a1a1a; font-weight: 800; display: grid; place-content: center; margin-bottom: 12px; }
.dms-landing .step h3 { margin: 0 0 8px; font-size: 16px; color: var(--brand); }
.dms-landing .step p { margin: 0; font-size: 13px; color: var(--muted); }

.dms-landing .plans { display: grid; grid-template-columns: 0.7fr 1fr 1fr; gap: 16px; margin-top: 36px; }
.dms-landing .plan { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 26px; }
.dms-landing .plan.intro { background: transparent; border: none; padding-left: 0; }
.dms-landing .plan h3 { margin: 0 0 14px; font-size: 22px; }
.dms-landing .plan h3.brand-name { font-size: 30px; font-weight: 800; }
.dms-landing .plan ul { list-style: none; margin: 0; padding: 0; }
.dms-landing .plan li { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; margin-bottom: 10px; }
.dms-landing .plan li::before { content: "✓"; color: var(--brand); font-weight: 800; }
.dms-landing .tag { display: inline-block; font-size: 12px; font-weight: 700; color: var(--brand); border: 1px solid var(--brand); border-radius: 999px; padding: 2px 10px; margin-bottom: 8px; }

.dms-landing .inquiry { background: linear-gradient(180deg, var(--bg), #100c08); }
.dms-landing .form-card { background: var(--surface); border: 1px solid var(--brand); border-radius: 20px; padding: 32px; margin-top: 28px; box-shadow: 0 0 0 1px rgba(255,122,26,0.10), 0 30px 80px rgba(0,0,0,0.4); }
.dms-landing .form-title { text-align: center; }
.dms-landing .form-title h2 { font-size: clamp(26px, 4vw, 38px); margin: 0 0 10px; font-weight: 800; }
.dms-landing .form-title p { color: var(--muted); margin: 0 0 8px; }
.dms-landing .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.dms-landing .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.dms-landing .field { margin-top: 16px; }
.dms-landing .field > label { display: block; font-weight: 700; font-size: 14px; margin-bottom: 8px; }
.dms-landing .field .hint { font-weight: 400; color: var(--muted); font-size: 12px; }
.dms-landing .field .ex { margin-top: 8px; font-size: 12px; color: var(--muted); }
.dms-landing .field .ex b { color: var(--brand); background: rgba(255,122,26,0.12); border-radius: 6px; padding: 1px 7px; margin-right: 6px; }
.dms-landing .input, .dms-landing .select, .dms-landing .textarea { width: 100%; background: #0E0E12; color: var(--text); border: 1px solid var(--line); border-radius: 12px; padding: 14px; font-size: 15px; outline: none; transition: border-color .15s, box-shadow .15s; }
.dms-landing .input:focus, .dms-landing .select:focus, .dms-landing .textarea:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(255,122,26,0.18); }
.dms-landing .input::placeholder, .dms-landing .textarea::placeholder { color: #6b6b72; }
.dms-landing .textarea { min-height: 110px; resize: vertical; }

.dms-landing .multiselect { position: relative; }
.dms-landing .multiselect-toggle { cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
.dms-landing .multiselect-panel { position: absolute; z-index: 20; left: 0; right: 0; top: calc(100% + 6px); background: #0E0E12; border: 1px solid var(--brand); border-radius: 12px; padding: 8px; max-height: 260px; overflow: auto; }
.dms-landing .multiselect-panel label { display: flex; gap: 10px; align-items: center; padding: 9px 10px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.dms-landing .multiselect-panel label:hover { background: rgba(255,122,26,0.10); }
.dms-landing .multiselect-panel input { accent-color: var(--brand); width: 16px; height: 16px; }
.dms-landing .honeypot { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

.dms-landing .btn-submit { width: 100%; margin-top: 24px; border: none; cursor: pointer; background: linear-gradient(180deg, var(--brand), var(--brand-dark)); color: #1a1209; font-weight: 800; font-size: 18px; padding: 18px; border-radius: 14px; transition: transform .08s, filter .15s; }
.dms-landing .btn-submit:hover { filter: brightness(1.05); }
.dms-landing .btn-submit:active { transform: translateY(1px); }
.dms-landing .btn-submit:disabled { opacity: .6; cursor: progress; }
.dms-landing .privacy { text-align: center; color: var(--muted); font-size: 13px; margin-top: 16px; }
.dms-landing .form-msg { margin-top: 14px; text-align: center; font-size: 14px; min-height: 20px; }
.dms-landing .form-msg.ok { color: #5fd28a; }
.dms-landing .form-msg.err { color: #ff7a7a; }

.dms-landing .floating-cta { position: fixed; right: 22px; bottom: 22px; z-index: 60; background: linear-gradient(180deg, var(--brand), var(--brand-dark)); color: #1a1209; font-weight: 800; font-size: 16px; border: none; cursor: pointer; padding: 15px 22px; border-radius: 999px; box-shadow: 0 12px 30px rgba(255,122,26,0.40); transition: transform .12s, box-shadow .12s; }
.dms-landing .floating-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(255,122,26,0.5); }

.dms-popup-overlay { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; padding: 20px; }
.dms-popup-card { background: var(--surface); border: 1px solid var(--brand); border-radius: 18px; max-width: 420px; width: 100%; overflow: hidden; color: var(--text); }
.dms-popup-card img { width: 100%; }
.dms-popup-body { padding: 24px; }
.dms-popup-body h3 { margin: 0 0 10px; font-size: 20px; }
.dms-popup-body p { margin: 0 0 18px; color: var(--muted); font-size: 14px; }
.dms-popup-actions a { display: block; text-align: center; text-decoration: none; background: var(--brand); color: #1a1209; font-weight: 800; padding: 12px; border-radius: 10px; }
.dms-popup-foot { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-top: 1px solid var(--line); font-size: 13px; color: var(--muted); }
.dms-popup-foot button { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 13px; }

.dms-landing .site-foot { border-top: 1px solid var(--line); padding: 28px 0; text-align: center; color: var(--muted); font-size: 13px; }

@media (max-width: 880px) {
  .dms-landing .hero-grid { grid-template-columns: 1fr; }
  .dms-landing .steps { grid-template-columns: repeat(2, 1fr); }
  .dms-landing .plans { grid-template-columns: 1fr; }
  .dms-landing .grid-3, .dms-landing .grid-2 { grid-template-columns: 1fr; }
}
`;
