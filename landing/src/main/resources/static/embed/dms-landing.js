/* =========================================================================
 * DM'S 상담 신청 폼 임베드 스크립트
 *
 * 아임웹/카페24 등 외부 사이트의 "코드 삽입(HTML)" 영역에 아래 한 줄만 붙여넣으면
 * 이 백엔드의 문의 폼이 iframe 으로 삽입되고, 접수/알림톡/문자/GA4/Meta 연동은
 * 전부 이 백엔드에서 처리된다. (iframe 방식이라 호스트 사이트 CSS 와 충돌하지 않음)
 *
 *   <div id="dms-form"></div>
 *   <script src="https://YOUR-BACKEND/embed/dms-landing.js" data-target="#dms-form" async></script>
 *
 * data-target 을 생략하면 스크립트 위치에 바로 삽입된다.
 * ========================================================================= */
(function () {
  "use strict";

  var current = document.currentScript;
  if (!current) {
    var scripts = document.getElementsByTagName("script");
    current = scripts[scripts.length - 1];
  }

  // 스크립트 src 에서 백엔드 origin 추출
  var origin;
  try {
    origin = new URL(current.src, location.href).origin;
  } catch (e) {
    origin = "";
  }

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/embed/form";
  iframe.title = "DM'S 무료 상담 신청";
  iframe.loading = "lazy";
  iframe.setAttribute("scrolling", "no");
  iframe.style.cssText = "width:100%;border:0;display:block;min-height:760px;background:transparent;";
  iframe.allowTransparency = "true";

  var targetSel = current.getAttribute("data-target");
  var mount = targetSel ? document.querySelector(targetSel) : null;
  if (mount) {
    mount.appendChild(iframe);
  } else if (current.parentNode) {
    current.parentNode.insertBefore(iframe, current.nextSibling);
  }

  // 자식 iframe 이 보내는 높이로 자동 리사이즈
  window.addEventListener("message", function (ev) {
    if (origin && ev.origin !== origin) return;
    var data = ev.data || {};
    if (data.type === "dms-embed-height" && data.height) {
      iframe.style.height = data.height + "px";
    }
  });
})();
