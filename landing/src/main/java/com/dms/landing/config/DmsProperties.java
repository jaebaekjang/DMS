package com.dms.landing.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * {@code dms.*} 환경 설정. 비밀값(API 키 등)은 전부 환경변수로 주입되며
 * 클라이언트(브라우저)로 절대 전달되지 않는다.
 */
@ConfigurationProperties(prefix = "dms")
public class DmsProperties {

    private String dataDir = "./data";
    private Admin admin = new Admin();
    private Security security = new Security();
    private Integrations integrations = new Integrations();

    public String getDataDir() { return dataDir; }
    public void setDataDir(String dataDir) { this.dataDir = dataDir; }
    public Admin getAdmin() { return admin; }
    public void setAdmin(Admin admin) { this.admin = admin; }
    public Security getSecurity() { return security; }
    public void setSecurity(Security security) { this.security = security; }
    public Integrations getIntegrations() { return integrations; }
    public void setIntegrations(Integrations integrations) { this.integrations = integrations; }

    public static class Admin {
        private String username = "admin";
        private String passwordHash = "";
        private String password = "change-me-now";

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class Security {
        private String allowedOrigins = "";
        private int inquiryRatePerMinute = 5;

        public String getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(String allowedOrigins) { this.allowedOrigins = allowedOrigins; }
        public int getInquiryRatePerMinute() { return inquiryRatePerMinute; }
        public void setInquiryRatePerMinute(int inquiryRatePerMinute) { this.inquiryRatePerMinute = inquiryRatePerMinute; }
    }

    public static class Integrations {
        private Ga4 ga4 = new Ga4();
        private Meta meta = new Meta();
        private Messaging messaging = new Messaging();

        public Ga4 getGa4() { return ga4; }
        public void setGa4(Ga4 ga4) { this.ga4 = ga4; }
        public Meta getMeta() { return meta; }
        public void setMeta(Meta meta) { this.meta = meta; }
        public Messaging getMessaging() { return messaging; }
        public void setMessaging(Messaging messaging) { this.messaging = messaging; }
    }

    public static class Ga4 {
        private String apiSecret = "";
        public String getApiSecret() { return apiSecret; }
        public void setApiSecret(String apiSecret) { this.apiSecret = apiSecret; }
    }

    public static class Meta {
        private String accessToken = "";
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    }

    public static class Messaging {
        private String providerUrl = "";
        private String apiKey = "";
        private String apiSecret = "";
        public String getProviderUrl() { return providerUrl; }
        public void setProviderUrl(String providerUrl) { this.providerUrl = providerUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getApiSecret() { return apiSecret; }
        public void setApiSecret(String apiSecret) { this.apiSecret = apiSecret; }
    }
}
