package com.dms.landing.service.integration;

import com.dms.landing.config.DmsProperties;
import com.dms.landing.model.Inquiry;
import com.dms.landing.model.SiteConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 신규 문의 발생 시 외부 연동을 비동기 best-effort 로 발송한다.
 *
 * <p>어느 연동이 실패해도 문의 접수 자체는 성공으로 처리한다(고객 경험 우선).
 * 비밀값(메시징 API 키, GA4 api_secret, Meta CAPI 토큰)은 전부 서버 환경변수에서 읽으며
 * 클라이언트로 노출되지 않는다.
 */
@Service
public class IntegrationDispatcher {

    private static final Logger log = LoggerFactory.getLogger(IntegrationDispatcher.class);

    private final DmsProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public IntegrationDispatcher(DmsProperties props) {
        this.props = props;
    }

    @Async
    public void dispatch(Inquiry inquiry, SiteConfig config) {
        SiteConfig.Notify notify = config.getNotify();
        if (notify.getWebhookUrl() != null && !notify.getWebhookUrl().isBlank()) {
            safe("webhook", () -> sendWebhook(notify.getWebhookUrl(), inquiry));
        }
        if (notify.isAlimtalkEnabled() && hasMessaging()) {
            safe("alimtalk", () -> sendKakaoAlimtalk(inquiry, notify));
        }
        if (notify.isSmsEnabled() && hasMessaging()) {
            safe("sms", () -> sendSms(inquiry, notify));
        }
        String ga4Id = config.getTracking().getGa4MeasurementId();
        if (ga4Id != null && !ga4Id.isBlank() && !props.getIntegrations().getGa4().getApiSecret().isBlank()) {
            safe("ga4", () -> sendGa4Event(inquiry, ga4Id));
        }
        String pixelId = config.getTracking().getMetaPixelId();
        if (pixelId != null && !pixelId.isBlank() && !props.getIntegrations().getMeta().getAccessToken().isBlank()) {
            safe("meta-capi", () -> sendMetaCapi(inquiry, pixelId));
        }
    }

    private boolean hasMessaging() {
        DmsProperties.Messaging m = props.getIntegrations().getMessaging();
        return notBlank(m.getProviderUrl()) && notBlank(m.getApiKey());
    }

    // ---- 개별 연동 ----

    private void sendWebhook(String url, Inquiry inquiry) throws Exception {
        postJson(url, mapper.writeValueAsString(inquiry), Map.of());
    }

    /** 카카오 알림톡 (Solapi 호환 예시 페이로드). 실제 템플릿/엔드포인트는 환경설정에 맞춰 조정. */
    private void sendKakaoAlimtalk(Inquiry inquiry, SiteConfig.Notify notify) throws Exception {
        if (!notBlank(notify.getAdminPhone())) return;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("to", digits(notify.getAdminPhone()));
        body.put("type", "ATA"); // 알림톡
        body.put("templateId", notify.getAlimtalkTemplateId());
        body.put("text", buildMessage(inquiry));
        postMessaging(body);
    }

    private void sendSms(Inquiry inquiry, SiteConfig.Notify notify) throws Exception {
        if (!notBlank(notify.getAdminPhone())) return;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("to", digits(notify.getAdminPhone()));
        body.put("type", "LMS");
        body.put("text", buildMessage(inquiry));
        postMessaging(body);
    }

    private void postMessaging(Map<String, Object> body) throws Exception {
        DmsProperties.Messaging m = props.getIntegrations().getMessaging();
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("Authorization", "Bearer " + m.getApiKey());
        if (notBlank(m.getApiSecret())) headers.put("X-Api-Secret", m.getApiSecret());
        postJson(m.getProviderUrl(), mapper.writeValueAsString(body), headers);
    }

    /** GA4 Measurement Protocol 서버 이벤트(generate_lead). */
    private void sendGa4Event(Inquiry inquiry, String measurementId) throws Exception {
        String apiSecret = props.getIntegrations().getGa4().getApiSecret();
        String url = "https://www.google-analytics.com/mp/collect?measurement_id="
                + enc(measurementId) + "&api_secret=" + enc(apiSecret);
        Map<String, Object> event = Map.of(
                "name", "generate_lead",
                "params", Map.of("source", "landing_form", "region", nz(inquiry.getRegion())));
        Map<String, Object> payload = Map.of(
                "client_id", inquiry.getId(),
                "events", new Object[]{event});
        postJson(url, mapper.writeValueAsString(payload), Map.of());
    }

    /** Meta Conversions API(Lead). 서버 측 토큰 사용. */
    private void sendMetaCapi(Inquiry inquiry, String pixelId) throws Exception {
        String token = props.getIntegrations().getMeta().getAccessToken();
        String url = "https://graph.facebook.com/v19.0/" + enc(pixelId)
                + "/events?access_token=" + enc(token);
        Map<String, Object> data = Map.of(
                "event_name", "Lead",
                "event_time", System.currentTimeMillis() / 1000,
                "action_source", "website",
                "user_data", Map.of("ph", inquiry.getIpHash() == null ? "" : inquiry.getIpHash()));
        Map<String, Object> payload = Map.of("data", new Object[]{data});
        postJson(url, mapper.writeValueAsString(payload), Map.of());
    }

    // ---- 공통 ----

    private String buildMessage(Inquiry i) {
        return "[DM'S 신규 상담 신청]\n"
                + "매장: " + nz(i.getStoreName()) + "\n"
                + "연락처: " + nz(i.getPhone()) + "\n"
                + "지역: " + nz(i.getRegion()) + " / 업종: " + nz(i.getIndustry()) + " / 평수: " + nz(i.getSize()) + "\n"
                + "문제: " + i.issuesText();
    }

    private void postJson(String url, String json, Map<String, String> headers) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(8))
                .header("Content-Type", "application/json");
        headers.forEach(b::header);
        HttpResponse<String> res = http.send(
                b.POST(HttpRequest.BodyPublishers.ofString(json)).build(),
                HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() >= 400) {
            log.warn("연동 응답 오류 {} ({})", res.statusCode(), url);
        }
    }

    private void safe(String name, ThrowingRunnable r) {
        try {
            r.run();
        } catch (Exception e) {
            log.warn("연동 실패 [{}]: {}", name, e.getMessage());
        }
    }

    private interface ThrowingRunnable { void run() throws Exception; }

    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }
    private static String nz(String s) { return s == null ? "" : s; }
    private static String digits(String s) { return s == null ? "" : s.replaceAll("[^0-9]", ""); }
    private static String enc(String s) { return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8); }
}
