package com.dms.landing.service;

import com.dms.landing.model.Inquiry;
import com.dms.landing.model.InquiryRequest;
import com.dms.landing.model.SiteConfig;
import com.dms.landing.repository.InquiryRepository;
import com.dms.landing.service.integration.IntegrationDispatcher;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** 문의 접수 처리: 정제 → 저장 → 연동 발송. */
@Service
public class InquiryService {

    private final InquiryRepository repository;
    private final SiteConfigService siteConfigService;
    private final IntegrationDispatcher dispatcher;

    public InquiryService(InquiryRepository repository,
                          SiteConfigService siteConfigService,
                          IntegrationDispatcher dispatcher) {
        this.repository = repository;
        this.siteConfigService = siteConfigService;
        this.dispatcher = dispatcher;
    }

    public Inquiry create(InquiryRequest req, String clientIp) {
        Inquiry inquiry = new Inquiry();
        inquiry.setId(UUID.randomUUID().toString());
        inquiry.setStoreName(clean(req.getStoreName(), 100));
        inquiry.setPhone(clean(req.getPhone(), 20));
        inquiry.setRegion(clean(req.getRegion(), 50));
        inquiry.setIndustry(clean(req.getIndustry(), 60));
        inquiry.setSize(clean(req.getSize(), 60));
        inquiry.setMessage(clean(req.getMessage(), 2000));
        inquiry.setSourceUrl(clean(req.getSourceUrl(), 500));

        List<String> issues = new ArrayList<>();
        if (req.getIssues() != null) {
            for (String it : req.getIssues()) {
                String c = clean(it, 60);
                if (!c.isBlank()) issues.add(c);
            }
        }
        inquiry.setIssues(issues);
        inquiry.setIpHash(hashIp(clientIp));

        Inquiry saved = repository.save(inquiry);

        SiteConfig config = siteConfigService.get();
        dispatcher.dispatch(saved, config);
        return saved;
    }

    public List<Inquiry> all() { return repository.findAll(); }

    public long count() { return repository.count(); }

    /**
     * 제어문자 제거 + 길이 제한. (XSS 는 출력 시 템플릿이 escape 하므로 여기서는 정규화만 수행한다.)
     */
    private static String clean(String s, int max) {
        if (s == null) return "";
        String trimmed = s.replaceAll("[\\p{Cntrl}&&[^\\r\\n\\t]]", "").trim();
        return trimmed.length() > max ? trimmed.substring(0, max) : trimmed;
    }

    private static String hashIp(String ip) {
        if (ip == null) return "";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(("dms-salt:" + ip).getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) sb.append(String.format("%02x", d[i]));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return "";
        }
    }
}
