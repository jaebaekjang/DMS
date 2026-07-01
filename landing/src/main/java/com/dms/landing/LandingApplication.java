package com.dms.landing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DM'S 매장 토탈케어 구독 서비스 랜딩페이지 + 문의 접수 백엔드.
 *
 * <p>한 개의 Spring Boot 애플리케이션이 다음을 모두 제공한다.
 * <ul>
 *   <li>공개 랜딩페이지({@code /}) — 블랙/주황 디자인, 상품 설명 + 무료 상담 신청 폼</li>
 *   <li>문의 접수 API({@code POST /api/inquiry}) — 아임웹 등 외부 사이트 임베드 위젯에서도 호출</li>
 *   <li>관리자({@code /admin}) — 디자인/팝업/연동 설정 + 문의 조회</li>
 *   <li>연동 — GA4 / Meta(Pixel·CAPI) / 알림톡·문자 / 웹훅(CRM)</li>
 * </ul>
 */
@SpringBootApplication
public class LandingApplication {
    public static void main(String[] args) {
        SpringApplication.run(LandingApplication.class, args);
    }
}
