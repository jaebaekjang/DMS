package com.dms.landing.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** 접수된 무료 상담 신청 한 건. */
public class Inquiry {

    private String id;
    private String createdAt;          // ISO-8601
    private String storeName;          // 매장명
    private String phone;              // 연락처
    private String region;             // 지역
    private List<String> issues = new ArrayList<>(); // 현재 문제(복수)
    private String industry;           // 업종
    private String size;               // 평수
    private String message;            // 문의 내용(선택)

    // 접수 메타(서버에서만 기록 — 응답으로 클라이언트에 돌려주지 않음)
    private String sourceUrl;          // 폼이 떠 있던 페이지(임베드 추적)
    private String ipHash;             // IP 해시(개인정보 최소화)
    private String status = "신규";

    public Inquiry() {
        this.createdAt = Instant.now().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public List<String> getIssues() { return issues; }
    public void setIssues(List<String> issues) { this.issues = issues; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public String getIpHash() { return ipHash; }
    public void setIpHash(String ipHash) { this.ipHash = ipHash; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String issuesText() {
        return issues == null ? "" : String.join(", ", issues);
    }
}
