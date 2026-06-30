package com.dms.landing.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

/**
 * 문의 폼 입력 DTO. 서버에서 검증/정제 후 {@link Inquiry} 로 변환한다.
 * 모든 길이 제한은 DoS/저장소 오염 방지를 위한 상한이다.
 */
public class InquiryRequest {

    @NotBlank(message = "매장명을 입력해주세요.")
    @Size(max = 100)
    private String storeName;

    @NotBlank(message = "연락처를 입력해주세요.")
    @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "연락처 형식이 올바르지 않습니다.")
    private String phone;

    @Size(max = 50)
    private String region;

    private List<@Size(max = 60) String> issues = new ArrayList<>();

    @Size(max = 60)
    private String industry;

    @Size(max = 60)
    private String size;

    @Size(max = 2000, message = "문의 내용이 너무 깁니다.")
    private String message;

    @Size(max = 500)
    private String sourceUrl;

    /** 스팸 봇 차단용 허니팟. 사람이 보면 비어 있어야 정상. */
    @Size(max = 0, message = "잘못된 요청입니다.")
    private String company = "";

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
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
}
