# DM'S 랜딩페이지 (Java / Spring Boot)

매장 토탈케어 **월 구독 서비스** 랜딩페이지 + 무료 상담 신청 접수 백엔드.
하나의 Spring Boot 애플리케이션이 다음을 모두 제공합니다.

- **공개 랜딩페이지** (`/`) — 블랙/주황 디자인, 상품 설명 + 무료 상담 신청 폼 (사진/영상 첨부 없음)
- **상단부터 따라다니는 플로팅 "무료 상담 신청" 버튼** → 클릭 시 문의 폼으로 스크롤
- **문의 접수 API** (`POST /api/inquiry`) — 아임웹 등 외부 사이트 임베드 위젯에서도 호출
- **임베드 위젯** (`/embed/dms-landing.js`) — 아임웹·카페24 "코드 삽입"에 한 줄로 삽입
- **관리자(어드민)** (`/admin`) — 디자인 수정 · 팝업 설정 · 연동 설정 · 문의 조회
- **연동** — GA4 / Meta(Pixel·CAPI) / 카카오 알림톡·문자 / CRM 웹훅

> 기존 Next.js CRM(`/src`)은 그대로 두고, 이 `landing/` 디렉터리에 독립 실행되는
> Java 백엔드를 추가했습니다. 외부 호스팅(JVM 가능한 어디든)으로 옮겨 붙일 수 있습니다.

---

## 실행

```bash
cd landing
mvn spring-boot:run          # 개발 실행 (http://localhost:8080)
# 또는
mvn package && java -jar target/dms-landing.jar
```

- 랜딩: <http://localhost:8080/>
- 어드민: <http://localhost:8080/admin> (기본 계정 `admin` / 비밀번호는 아래 환경변수)

데이터(문의·사이트설정)는 외부 DB 없이 `DMS_DATA_DIR`(기본 `./data`)에 JSON 파일로 저장됩니다.

---

## 배포 (JVM 호스팅 — 라이브 주소 받기)

> Vercel 은 Spring Boot(Java 서버)를 정식 지원하지 않으므로, 아래 JVM 호스팅을 사용합니다.
> 어느 방식이든 **본인 계정에 이 저장소를 연결**하면 라이브 주소가 발급됩니다.
> 포함된 `Dockerfile` 하나로 어디서나 동일하게 빌드됩니다. (앱은 호스팅이 주는 `$PORT` 를 자동 사용)

### A. Render (가장 간단 · `render.yaml` 블루프린트 포함)
1. <https://render.com> 가입 → **New → Blueprint** → 이 GitHub 저장소 선택
2. 저장소 루트의 `render.yaml` 을 자동 인식 → **Apply**
3. 빌드 완료 후 `https://dms-landing-xxxx.onrender.com` 주소 발급
4. **Environment** 에서 `ADMIN_PASSWORD_HASH`(또는 `ADMIN_PASSWORD`) 입력 후 재배포
   - ⚠️ 무료 플랜은 영구 디스크가 없어 재배포 시 파일 데이터가 초기화됩니다.
     문의 유실 방지를 위해 어드민 → 연동 설정에서 **CRM 웹훅/알림톡**을 함께 켜두세요.
     영구 보존이 필요하면 유료 플랜 + `render.yaml` 의 `disk` 블록 주석 해제.

### B. Railway
1. <https://railway.app> → **New Project → Deploy from GitHub repo** → 이 저장소
2. 서비스 설정에서 **Root Directory = `landing`** 지정 (포함된 `Dockerfile` 사용)
3. **Variables** 에 `ADMIN_PASSWORD_HASH` 등 입력 → 배포 → 공개 도메인(`*.up.railway.app`) 발급
4. 영구 보존은 **Volume** 을 `/data` 에 마운트

### C. Fly.io
```bash
cd landing
fly launch --no-deploy        # 앱 생성 (Dockerfile 자동 인식)
fly volumes create dms_data --size 1
# fly.toml 의 [mounts] 에 source="dms_data" destination="/data" 추가
fly secrets set ADMIN_PASSWORD_HASH='...'
fly deploy
```

> Docker 가 있는 곳이라면 직접 실행도 가능합니다:
> `docker build -t dms-landing landing && docker run -p 8080:8080 -e ADMIN_PASSWORD=... dms-landing`

---

## 아임웹 등 외부 사이트에 붙이기

아임웹 편집 화면에서 **위젯 추가 → 코드 삽입(HTML)** 에 아래를 붙여넣으세요.
이 백엔드가 배포된 주소로 `src` 만 바꾸면 됩니다.

```html
<div id="dms-form"></div>
<script src="https://YOUR-BACKEND/embed/dms-landing.js" data-target="#dms-form" async></script>
```

- 폼이 **iframe** 으로 삽입되어 호스트 사이트 CSS 와 충돌하지 않고, 높이는 자동 조절됩니다.
- 접수/알림톡/문자/GA4/Meta 연동은 전부 이 백엔드에서 처리됩니다.
- 직접 `fetch` 로 `POST /api/inquiry` 를 호출해도 됩니다(허용 Origin 설정은 `ALLOWED_ORIGINS`).

---

## 환경변수

| 변수 | 설명 | 필수 |
| --- | --- | --- |
| `ADMIN_USERNAME` | 어드민 아이디 (기본 `admin`) | |
| `ADMIN_PASSWORD_HASH` | 어드민 비밀번호 **BCrypt 해시** (권장) | ★ |
| `ADMIN_PASSWORD` | 평문 비밀번호 (해시 없을 때만 사용, 개발용) | |
| `DMS_DATA_DIR` | 데이터 저장 경로 (기본 `./data`) | |
| `ALLOWED_ORIGINS` | 문의 API 를 호출할 외부 Origin 허용 목록(콤마 구분) | |
| `INQUIRY_RATE_PER_MINUTE` | IP 당 분당 문의 제출 제한 (기본 5) | |
| `GA4_API_SECRET` | GA4 Measurement Protocol 서버 이벤트용 비밀 | |
| `META_CAPI_TOKEN` | Meta Conversions API 액세스 토큰 | |
| `MSG_PROVIDER_URL` / `MSG_API_KEY` / `MSG_API_SECRET` | 알림톡·문자 발송 제공사(Solapi 호환 등) | |

BCrypt 해시 생성 예:

```bash
java -jar target/dms-landing.jar  # 실행 후 어드민은 ADMIN_PASSWORD 로 1회 로그인 가능
# 운영 전환 시: 원하는 비밀번호의 BCrypt 해시를 만들어 ADMIN_PASSWORD_HASH 로 주입
```

> GA4 측정 ID / Meta 픽셀 ID 같은 **공개 ID** 는 어드민 화면에서 입력합니다.
> API 키·토큰 등 **비밀값은 화면에 입력하지 않고 환경변수로만** 관리되며 브라우저로 노출되지 않습니다.

---

## 보안 처리 (기존 취약점 대응)

- **어드민 인증 추가** — Spring Security 폼 로그인 + BCrypt. 기존 "이름만 입력" 방식 대신 비밀번호 필요.
- **비밀값 분리** — 외부 API 키/토큰은 서버 환경변수 전용. 공개 설정(`/api/site-config`)에 비밀값 미포함.
- **입력 검증·정제** — Bean Validation(연락처 형식 등) + 길이 상한 + 제어문자 제거. 출력은 템플릿이 자동 escape(XSS 방지).
- **스팸/봇 차단** — 허니팟 필드 + IP 당 분당 제출 제한(고정 윈도우).
- **CSRF** — 어드민 폼은 CSRF 보호 유지, 공개 `/api/**` 만 예외.
- **보안 헤더** — CSP, Referrer-Policy, X-Frame-Options(랜딩은 DENY). 임베드 폼만 별도 체인으로 `frame-ancestors *` 허용.
- **CORS** — 공개 문의 API 는 자격증명 없이(`allowCredentials=false`) Origin 허용 목록 기반.
- **IP 최소 수집** — 원문 IP 대신 SHA-256 부분 해시만 저장.

---

## 주요 경로

| 경로 | 설명 |
| --- | --- |
| `GET /` | 랜딩페이지 |
| `POST /api/inquiry` | 문의 접수(JSON) |
| `GET /api/site-config` | 공개 설정(디자인/팝업/공개 트래킹 ID) |
| `GET /embed/form` | 임베드용 폼 단독 페이지(iframe) |
| `GET /embed/dms-landing.js` | 임베드 로더 스크립트 |
| `GET /admin` | 문의 접수 목록 |
| `GET/POST /admin/design` | 디자인(색상·문구) 수정 |
| `GET/POST /admin/popup` | 팝업 설정 |
| `GET /admin/integrations` · `POST /admin/tracking` · `POST /admin/notify` | 연동 설정 |
