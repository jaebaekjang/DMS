package com.dms.landing.model;

import java.util.ArrayList;
import java.util.List;

/**
 * 관리자(어드민)가 편집하는 사이트 설정.
 *
 * <p>여기에는 <b>공개되어도 안전한 값만</b> 담는다(디자인 텍스트/색상, 팝업, GA4 측정 ID,
 * Meta 픽셀 ID 등은 본래 브라우저에 노출되는 값). 알림톡 API 키, Meta CAPI 토큰 같은
 * 비밀값은 절대 여기에 두지 않고 서버 환경변수로만 관리한다.
 */
public class SiteConfig {

    private Design design = new Design();
    private Popup popup = new Popup();
    private Tracking tracking = new Tracking();
    private Notify notify = new Notify();
    private FormOptions formOptions = new FormOptions();

    public Design getDesign() { return design; }
    public void setDesign(Design design) { this.design = design; }
    public Popup getPopup() { return popup; }
    public void setPopup(Popup popup) { this.popup = popup; }
    public Tracking getTracking() { return tracking; }
    public void setTracking(Tracking tracking) { this.tracking = tracking; }
    public Notify getNotify() { return notify; }
    public void setNotify(Notify notify) { this.notify = notify; }
    public FormOptions getFormOptions() { return formOptions; }
    public void setFormOptions(FormOptions formOptions) { this.formOptions = formOptions; }

    /** 색상/문구 등 디자인. 블랙/주황을 기본값으로 한다. */
    public static class Design {
        private String primaryColor = "#FF7A1A";   // 주황 (포인트)
        private String primaryDark = "#E25E00";
        private String bgColor = "#0B0B0D";         // 블랙 배경
        private String surfaceColor = "#16161A";    // 카드 표면
        private String textColor = "#F5F5F7";       // 본문 텍스트(가독성)
        private String mutedColor = "#A1A1AA";      // 보조 텍스트

        private String brandName = "DM'S";
        private String heroTitle = "기존 방역비로, 설비·청소까지 관리받는 월 구독 서비스";
        private String heroSubtitle = "벌레, 냄새, 후드, 배수구, 에어컨, 현장점검, 설비 문제까지 한 번에 관리해드립니다.";
        private String formTitle = "무료 상담 신청";
        private String formSubtitle = "접수해주신 내용을 전문가가 검토한 후, 매장 상황에 맞는 상담을 위해 빠르게 전화드립니다.";
        private String ctaLabel = "무료 상담 신청하기";
        private String floatingLabel = "💬 무료 상담 신청";
        private String privacyNote = "입력하신 정보는 상담 용도로만 사용되며, 안전하게 보호됩니다.";

        public String getPrimaryColor() { return primaryColor; }
        public void setPrimaryColor(String v) { this.primaryColor = v; }
        public String getPrimaryDark() { return primaryDark; }
        public void setPrimaryDark(String v) { this.primaryDark = v; }
        public String getBgColor() { return bgColor; }
        public void setBgColor(String v) { this.bgColor = v; }
        public String getSurfaceColor() { return surfaceColor; }
        public void setSurfaceColor(String v) { this.surfaceColor = v; }
        public String getTextColor() { return textColor; }
        public void setTextColor(String v) { this.textColor = v; }
        public String getMutedColor() { return mutedColor; }
        public void setMutedColor(String v) { this.mutedColor = v; }
        public String getBrandName() { return brandName; }
        public void setBrandName(String v) { this.brandName = v; }
        public String getHeroTitle() { return heroTitle; }
        public void setHeroTitle(String v) { this.heroTitle = v; }
        public String getHeroSubtitle() { return heroSubtitle; }
        public void setHeroSubtitle(String v) { this.heroSubtitle = v; }
        public String getFormTitle() { return formTitle; }
        public void setFormTitle(String v) { this.formTitle = v; }
        public String getFormSubtitle() { return formSubtitle; }
        public void setFormSubtitle(String v) { this.formSubtitle = v; }
        public String getCtaLabel() { return ctaLabel; }
        public void setCtaLabel(String v) { this.ctaLabel = v; }
        public String getFloatingLabel() { return floatingLabel; }
        public void setFloatingLabel(String v) { this.floatingLabel = v; }
        public String getPrivacyNote() { return privacyNote; }
        public void setPrivacyNote(String v) { this.privacyNote = v; }
    }

    /** 진입 팝업(공지/이벤트) 설정. */
    public static class Popup {
        private boolean enabled = false;
        private String title = "DM'S 월 구독 이벤트";
        private String body = "지금 상담 신청하시면 첫 달 정기점검을 무료로 제공해드립니다.";
        private String imageUrl = "";
        private String linkUrl = "#inquiry";
        private String buttonLabel = "상담 신청하러 가기";
        private int hideForDays = 1;   // "오늘 하루 보지 않기" 일수

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean v) { this.enabled = v; }
        public String getTitle() { return title; }
        public void setTitle(String v) { this.title = v; }
        public String getBody() { return body; }
        public void setBody(String v) { this.body = v; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String v) { this.imageUrl = v; }
        public String getLinkUrl() { return linkUrl; }
        public void setLinkUrl(String v) { this.linkUrl = v; }
        public String getButtonLabel() { return buttonLabel; }
        public void setButtonLabel(String v) { this.buttonLabel = v; }
        public int getHideForDays() { return hideForDays; }
        public void setHideForDays(int v) { this.hideForDays = v; }
    }

    /** 클라이언트 측 트래킹(공개 ID). 비어 있으면 해당 스크립트는 주입되지 않는다. */
    public static class Tracking {
        private String ga4MeasurementId = "";   // 예: G-XXXXXXXXXX
        private String metaPixelId = "";        // 예: 1234567890

        public String getGa4MeasurementId() { return ga4MeasurementId; }
        public void setGa4MeasurementId(String v) { this.ga4MeasurementId = v; }
        public String getMetaPixelId() { return metaPixelId; }
        public void setMetaPixelId(String v) { this.metaPixelId = v; }
    }

    /** 알림/CRM 연동 대상(주소만 보관, 인증 비밀값은 서버 환경변수). */
    public static class Notify {
        private boolean alimtalkEnabled = false;   // 카카오 알림톡 발송
        private boolean smsEnabled = false;         // 문자(SMS) 발송
        private String adminPhone = "";             // 신규 문의 알림 받을 관리자 번호
        private String alimtalkTemplateId = "";     // 알림톡 승인 템플릿 ID
        private String webhookUrl = "";             // 신규 문의를 전달할 CRM 웹훅(예: 구글 Apps Script / Next.js CRM)

        public boolean isAlimtalkEnabled() { return alimtalkEnabled; }
        public void setAlimtalkEnabled(boolean v) { this.alimtalkEnabled = v; }
        public boolean isSmsEnabled() { return smsEnabled; }
        public void setSmsEnabled(boolean v) { this.smsEnabled = v; }
        public String getAdminPhone() { return adminPhone; }
        public void setAdminPhone(String v) { this.adminPhone = v; }
        public String getAlimtalkTemplateId() { return alimtalkTemplateId; }
        public void setAlimtalkTemplateId(String v) { this.alimtalkTemplateId = v; }
        public String getWebhookUrl() { return webhookUrl; }
        public void setWebhookUrl(String v) { this.webhookUrl = v; }
    }

    /** 폼 드롭다운 옵션(예시 이미지 기준). 어드민에서 줄바꿈으로 편집. */
    public static class FormOptions {
        private List<String> regions = new ArrayList<>(List.of(
                "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "기타"));
        private List<String> issues = new ArrayList<>(List.of(
                "벌레/해충", "하수구 막힘 및 역류", "악취", "누수", "화장실 문제",
                "수도/수전 문제", "후드 청소 및 주방 시설", "바닥 찌든 때 제거",
                "에어컨 분해 세척", "매장 전체 관리"));
        private List<String> industries = new ArrayList<>(List.of(
                "음식점", "요리주점", "카페", "미용실/네일샵/뷰티샵", "편의점/리테일 매장", "기타"));
        private List<String> sizes = new ArrayList<>(List.of(
                "10평 미만", "10평 이상~20평 미만", "20평 이상~30평 미만",
                "30평 이상~50평 미만", "50평 이상"));

        public List<String> getRegions() { return regions; }
        public void setRegions(List<String> v) { this.regions = v; }
        public List<String> getIssues() { return issues; }
        public void setIssues(List<String> v) { this.issues = v; }
        public List<String> getIndustries() { return industries; }
        public void setIndustries(List<String> v) { this.industries = v; }
        public List<String> getSizes() { return sizes; }
        public void setSizes(List<String> v) { this.sizes = v; }
    }
}
