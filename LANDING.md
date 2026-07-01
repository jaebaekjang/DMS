# DM'S 랜딩페이지 (Next.js · Vercel 배포용)

매장 토탈케어 **월 구독 서비스** 랜딩페이지를 기존 Next.js 프로젝트에 통합한 버전입니다.
저장소를 **Vercel 에 Import 하면 그대로 `xxx.vercel.app` 주소가 발급**됩니다.

> 같은 저장소의 Java(Spring Boot) 버전(`landing/`)과 별개로, 이 문서는 **Vercel 용 Next.js 버전**을 설명합니다.

## 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 랜딩페이지 (블랙/주황, 상품 설명 + 무료 상담 신청 폼, 사진/영상 첨부 없음) |
| 플로팅 버튼 | 상단부터 따라다니는 "무료 상담 신청" → 클릭 시 폼으로 스크롤 |
| `POST /api/inquiry` | 문의 접수 (검증·정제·허니팟·레이트리밋 후 저장 + 연동 발송) |
| `GET /api/site-config` | 공개 설정(디자인/팝업/공개 트래킹 ID). 비밀값·관리자 정보 미포함 |
| `/admin` | 어드민 — 문의 조회 |
| `/admin/design` · `/admin/popup` · `/admin/integrations` | 디자인·팝업·연동 설정 |

기존 CRM(`/leads`, `/consultations` 등)은 그대로 유지됩니다.

## Vercel 배포

1. <https://vercel.com/new> → GitHub 계정 연결 → `jaebaekjang/DMS` **Import**
2. Framework 는 **Next.js** 자동 감지 → **Deploy** → `https://<프로젝트>.vercel.app` 발급
3. **Settings → Environment Variables** 에 최소 아래 값 설정 후 재배포
   - `ADMIN_PASSWORD` — 어드민 비밀번호(필수, 강력하게)
   - (권장) `ADMIN_SECRET` — 세션 서명 비밀
4. **문의 영구 저장**: Vercel 대시보드 **Storage → KV(Upstash) 생성 → 프로젝트 연결**
   → `KV_REST_API_URL` / `KV_REST_API_TOKEN` 이 자동 주입되어 문의·설정이 영구 저장됩니다.
   - KV 미연결 시 인메모리로 동작(콜드스타트 시 초기화)하므로, 어드민 → 연동 설정의
     **CRM 웹훅/알림톡**을 함께 켜두면 문의 유실을 막을 수 있습니다.

## 연동 (GA4 / Meta / 알림톡·문자 / CRM)

- **공개 ID**(GA4 측정 ID, Meta 픽셀 ID)는 어드민 → 연동 설정에서 입력 → 랜딩에 스크립트 자동 삽입.
- **비밀값**(GA4 api_secret, Meta CAPI 토큰, 알림톡/문자 API 키)은 화면에 입력하지 않고
  **환경변수로만** 관리(`.env.example` 참고). 클라이언트로 노출되지 않습니다.
- 신규 문의 시 서버가 다음을 best-effort 로 발송: CRM 웹훅 → 알림톡/문자 → GA4(서버 이벤트) → Meta CAPI.

## 보안 처리 (기존 취약점 대응)

- **어드민 인증** — 비밀번호 로그인 + HMAC 서명 httpOnly 세션 쿠키. 미들웨어가 `/admin/**` 강제 보호.
- **비밀값 분리** — 외부 API 키/토큰은 서버 환경변수 전용. 공개 설정에 관리자 번호/웹훅 미포함.
- **입력 검증·정제** — 연락처 형식/길이 상한/제어문자 제거. React 출력으로 XSS 방지.
- **스팸/봇 차단** — 허니팟 필드 + IP 당 분당 제출 제한.
- **보안 헤더** — CSP·X-Content-Type-Options·Referrer-Policy·X-Frame-Options(미들웨어 전역).
- **개인정보 최소화** — 원문 IP 대신 SHA-256 부분 해시만 저장.

## 로컬 실행

```bash
npm install
ADMIN_PASSWORD=test1234 npm run dev   # http://localhost:3000  (어드민 /admin)
```
