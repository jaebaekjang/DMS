package com.dms.landing.controller;

import com.dms.landing.model.Inquiry;
import com.dms.landing.model.InquiryRequest;
import com.dms.landing.model.SiteConfig;
import com.dms.landing.security.ClientIp;
import com.dms.landing.service.InquiryService;
import com.dms.landing.service.SiteConfigService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/** 공개 API: 문의 접수 + 공개 사이트 설정(임베드 위젯용). */
@RestController
public class ApiController {

    private final InquiryService inquiryService;
    private final SiteConfigService siteConfigService;

    public ApiController(InquiryService inquiryService, SiteConfigService siteConfigService) {
        this.inquiryService = inquiryService;
        this.siteConfigService = siteConfigService;
    }

    @PostMapping("/api/inquiry")
    public ResponseEntity<Map<String, Object>> submit(@Valid @RequestBody InquiryRequest req,
                                                      HttpServletRequest httpReq) {
        Inquiry saved = inquiryService.create(req, ClientIp.of(httpReq));
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ok", true);
        body.put("id", saved.getId());
        body.put("message", "상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.");
        return ResponseEntity.ok(body);
    }

    /** 임베드 위젯이 디자인/팝업/공개 트래킹 ID 를 받아가는 엔드포인트. 비밀값은 절대 포함하지 않는다. */
    @GetMapping("/api/site-config")
    public SiteConfig publicConfig() {
        return siteConfigService.get();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ok", false);
        FieldError first = ex.getBindingResult().getFieldError();
        body.put("message", first != null ? first.getDefaultMessage() : "입력값을 확인해주세요.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
