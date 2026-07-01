// ===== 외부 연동 발송 (서버 전용, best-effort) =====
// 비밀값은 전부 서버 환경변수에서만 읽으며 클라이언트로 노출되지 않는다.
// 어느 연동이 실패해도 문의 접수 자체는 성공으로 처리한다.

import type { SiteConfig } from "./config";
import type { Inquiry } from "./store";

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
  timeoutMs = 7000
): Promise<void> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(t);
  }
}

function buildMessage(i: Inquiry): string {
  return (
    `[DM'S 신규 상담 신청]\n` +
    `매장: ${i.storeName}\n` +
    `연락처: ${i.phone}\n` +
    `지역: ${i.region} / 업종: ${i.industry} / 평수: ${i.size}\n` +
    `문제: ${i.issues.join(", ")}`
  );
}

function digits(s: string): string {
  return (s || "").replace(/[^0-9]/g, "");
}

export async function dispatchIntegrations(
  inquiry: Inquiry,
  config: SiteConfig
): Promise<void> {
  const tasks: Promise<void>[] = [];
  const notify = config.notify;

  // 1) CRM 웹훅 (구글 Apps Script / 기존 CRM / Make·Zapier 등)
  if (notify.webhookUrl) {
    tasks.push(postJson(notify.webhookUrl, inquiry).catch(() => {}));
  }

  // 2) 알림톡 / 문자 (Solapi 호환 예시)
  const msgUrl = process.env.MSG_PROVIDER_URL;
  const msgKey = process.env.MSG_API_KEY;
  const msgSecret = process.env.MSG_API_SECRET;
  if (msgUrl && msgKey && notify.adminPhone) {
    const headers: Record<string, string> = { Authorization: `Bearer ${msgKey}` };
    if (msgSecret) headers["X-Api-Secret"] = msgSecret;
    if (notify.alimtalkEnabled) {
      tasks.push(
        postJson(
          msgUrl,
          { to: digits(notify.adminPhone), type: "ATA", templateId: notify.alimtalkTemplateId, text: buildMessage(inquiry) },
          headers
        ).catch(() => {})
      );
    }
    if (notify.smsEnabled) {
      tasks.push(
        postJson(
          msgUrl,
          { to: digits(notify.adminPhone), type: "LMS", text: buildMessage(inquiry) },
          headers
        ).catch(() => {})
      );
    }
  }

  // 3) GA4 Measurement Protocol (서버 이벤트)
  const ga4Id = config.tracking.ga4MeasurementId;
  const ga4Secret = process.env.GA4_API_SECRET;
  if (ga4Id && ga4Secret) {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
      ga4Id
    )}&api_secret=${encodeURIComponent(ga4Secret)}`;
    tasks.push(
      postJson(url, {
        client_id: inquiry.id,
        events: [{ name: "generate_lead", params: { source: "landing_form", region: inquiry.region } }],
      }).catch(() => {})
    );
  }

  // 4) Meta Conversions API (Lead)
  const pixelId = config.tracking.metaPixelId;
  const metaToken = process.env.META_CAPI_TOKEN;
  if (pixelId && metaToken) {
    const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(
      pixelId
    )}/events?access_token=${encodeURIComponent(metaToken)}`;
    tasks.push(
      postJson(url, {
        data: [
          {
            event_name: "Lead",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: { ph: inquiry.ipHash || "" },
          },
        ],
      }).catch(() => {})
    );
  }

  await Promise.allSettled(tasks);
}
