/* ===== DM'S 랜딩 동작: 플로팅 CTA · 복수선택 · 폼 제출 · 팝업 ===== */
(function () {
  "use strict";

  function scrollToInquiry() {
    var el = document.getElementById("inquiry");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 플로팅 문의 버튼 → 폼으로 이동
  var floating = document.getElementById("floatingCta");
  if (floating) floating.addEventListener("click", scrollToInquiry);

  // ===== 현재 문제 복수선택 드롭다운 =====
  var toggle = document.getElementById("issueToggle");
  var panel = document.getElementById("issuePanel");
  var label = document.getElementById("issueLabel");

  function refreshIssueLabel() {
    var checked = panel ? panel.querySelectorAll('input[name="issues"]:checked') : [];
    if (!label) return;
    if (checked.length === 0) {
      label.textContent = "현재 문제를 선택해주세요";
      label.style.color = "#6b6b72";
    } else {
      var names = Array.prototype.map.call(checked, function (c) { return c.value; });
      label.textContent = names.length > 2
        ? names.slice(0, 2).join(", ") + " 외 " + (names.length - 2) + "건"
        : names.join(", ");
      label.style.color = "";
    }
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    toggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle.click(); }
    });
    panel.addEventListener("change", refreshIssueLabel);
    document.addEventListener("click", function (e) {
      var wrap = document.getElementById("issueSelect");
      if (wrap && !wrap.contains(e.target)) {
        panel.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ===== 폼 제출 =====
  var form = document.getElementById("inquiryForm");
  var msg = document.getElementById("formMsg");
  var btn = document.getElementById("submitBtn");

  function setMsg(text, kind) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = "form-msg" + (kind ? " " + kind : "");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var payload = {
        storeName: (fd.get("storeName") || "").toString().trim(),
        phone: (fd.get("phone") || "").toString().trim(),
        region: (fd.get("region") || "").toString(),
        industry: (fd.get("industry") || "").toString(),
        size: (fd.get("size") || "").toString(),
        message: (fd.get("message") || "").toString().trim(),
        company: (fd.get("company") || "").toString(), // 허니팟
        sourceUrl: location.href,
        issues: fd.getAll("issues").map(String)
      };

      if (!payload.storeName) { setMsg("매장명을 입력해주세요.", "err"); return; }
      if (!/^[0-9+\-\s()]{7,20}$/.test(payload.phone)) { setMsg("연락처를 정확히 입력해주세요.", "err"); return; }

      if (btn) { btn.disabled = true; }
      setMsg("접수 중입니다...", "");

      fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, d: d }; }); })
        .then(function (r) {
          if (r.ok && r.d.ok) {
            setMsg(r.d.message || "상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.", "ok");
            form.reset();
            refreshIssueLabel();
            if (typeof gtag === "function") gtag("event", "generate_lead", { source: "landing_form" });
            if (typeof fbq === "function") fbq("track", "Lead");
          } else {
            setMsg((r.d && r.d.message) || "접수에 실패했습니다. 잠시 후 다시 시도해주세요.", "err");
          }
        })
        .catch(function () { setMsg("네트워크 오류로 접수에 실패했습니다.", "err"); })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  }

  // ===== 진입 팝업 =====
  var overlay = document.getElementById("popupOverlay");
  if (overlay) {
    var KEY = "dms_popup_hidden_until";
    var hiddenUntil = parseInt(localStorage.getItem(KEY) || "0", 10);
    if (Date.now() > hiddenUntil) {
      overlay.classList.add("open");
    }
    var close = document.getElementById("popupClose");
    var hideToday = document.getElementById("popupHideToday");
    var cta = document.getElementById("popupCta");
    function closePopup() { overlay.classList.remove("open"); }
    if (close) close.addEventListener("click", closePopup);
    if (cta) cta.addEventListener("click", closePopup);
    if (hideToday) hideToday.addEventListener("click", function () {
      var days = parseInt(overlay.getAttribute("data-days") || "1", 10);
      localStorage.setItem(KEY, String(Date.now() + days * 24 * 60 * 60 * 1000));
      closePopup();
    });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closePopup(); });
  }
})();
