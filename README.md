# DM'S CX 운영 CRM

DM'S 의 구독/계약 전환 **전(前)** 고객을 관리하기 위한 내부 운영용 CRM 입니다.
고객 문의를 접수하고, 리드 상태를 관리하고, 보류 고객을 재접촉해서 구독 계약
전환 가능성을 놓치지 않도록 돕습니다.

> **핵심 철학**
> AI 없이, **사람이 판단**하고, **이름 로그인**으로 누가 했는지 기록하며,
> 사이트 내 **모든 기록이 구글시트에 영구 보존**되는 CRM.

---

## 주요 특징

- **AI API 사용 안 함** — OpenAI/Claude/Gemini 등 외부 AI 미연동. 모든 판단(관리
  필요도, 계약 가능성, 보류 사유, 고객 상태, 다음 액션 등)은 사람이 직접 선택/입력.
- **이름 기반 로그인** — 권한 제한이 아니라 "누가 실행했는지"를 모든 기록에 남기기
  위한 용도. 역할/OAuth/이메일 로그인 없음.
- **영구 기록 보존** — 실제 삭제 없음. 삭제는 `삭제됨/비활성/아카이브됨` 상태 변경
  (soft delete)으로만 처리. 운영 탭은 update, 로그 탭은 항상 append.
- **구글시트 자동 저장** — 생성/수정/상태변경/재접촉/아카이브/복원/백업 기록이
  형식대로 탭별 자동 저장.
- **Mock 모드** — Google Sheets 없이 `localStorage` 로 즉시 실행/테스트 가능.

## 기술 스택

Next.js (App Router) · React · TypeScript · Tailwind CSS · Google Sheets API
(서버 전용) · localStorage mock mode · 한국어 데스크톱 우선 UI

---

## 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 →
이름 입력 후 로그인하면 CRM 으로 진입합니다.

> 별도 설정 없이 기본값(`NEXT_PUBLIC_USE_MOCK_DATA=true`)으로 동작하며, 초기
> 더미 데이터 10건이 자동으로 채워집니다. (브라우저 `localStorage` 에 저장)

프로덕션 빌드:

```bash
npm run build
npm run start
```

---

## 환경변수 (`.env.local`)

`.env.example` 을 복사해 `.env.local` 을 만들고 값을 채웁니다.

```env
# true  : Google Sheets 없이 localStorage / mock 데이터로 동작
# false : 서버 API 를 통해 실제 Google Sheets 에 저장/조회
NEXT_PUBLIC_USE_MOCK_DATA=true

# 아래 3개는 NEXT_PUBLIC_USE_MOCK_DATA=false 일 때만 필요 (서버에서만 사용)
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

- `GOOGLE_*` 값은 **서버(API route)에서만** 사용되며 프론트엔드 번들에 포함되지
  않습니다. (`NEXT_PUBLIC_` 접두사를 쓰지 않음)
- 로그인 관련 환경변수(AUTH_SECRET / GOOGLE_CLIENT_ID 등)는 사용하지 않습니다.

### Google Sheets 연동 준비 (real mode)

1. Google Cloud 콘솔에서 **Google Sheets API** 활성화.
2. **서비스 계정**을 생성하고 JSON 키를 발급받습니다.
3. JSON 의 `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
   `private_key` → `GOOGLE_PRIVATE_KEY` 에 입력합니다.
   - private key 의 줄바꿈은 `\n` 으로 escape 하고 전체를 큰따옴표로 감쌉니다.
     예) `GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`
4. 사용할 스프레드시트를 만들고, 그 **서비스 계정 이메일에 편집자 권한으로 공유**합니다.
5. 스프레드시트 URL 의 ID(`/d/` 와 `/edit` 사이)를 `GOOGLE_SHEET_ID` 에 입력합니다.
6. `NEXT_PUBLIC_USE_MOCK_DATA=false` 로 바꾸고 재시작합니다.
7. CRM 의 **설정 → 구글시트 초기화** 를 눌러 탭과 헤더를 생성합니다.
   (기존 데이터는 삭제하지 않고, 없는 탭/헤더만 보정합니다.)

---

## 페이지

| 경로 | 설명 |
| --- | --- |
| `/login` | 이름 로그인 |
| `/leads` | 리드 마스터 (메인) |
| `/consultations` | 상담 접수 |
| `/follow-ups` | CRM 재접촉 |
| `/customers/[leadId]` | 고객 상세 (전체 히스토리) |
| `/archive` | 아카이브 관리 (+ 데이터변경로그 / 상태변경이력 조회) |
| `/settings` | 설정 (구글시트 초기화 / 전체 백업 / 기본값) |

## 구글시트 탭 구조

```
DM'S CX 운영 CRM
├─ 리드마스터          (운영) 현재 운영 중인 고객 최신 상태
├─ 상담접수            (운영) 상담 접수 기록
├─ CRM재접촉           (운영) 보류 고객 재접촉 관리
├─ 상태변경이력        (로그) 현재 단계 변경 기록
├─ 데이터변경로그      (로그) 모든 생성/수정/삭제/아카이브/복원/백업 기록
├─ 리드스냅샷로그      (로그) 리드 수정 시 전체 값 누적
├─ 상담원본로그        (로그) 상담 원본 영구 누적
├─ CRM재접촉로그       (로그) 재접촉 생성/수정/완료 누적
├─ 아카이브_리드        장기 보관
├─ 아카이브_상담        장기 보관
└─ 아카이브_CRM재접촉   장기 보관
```

- 운영 탭은 `leadId`(또는 행 id) 기준으로 update 가능.
- **로그 탭은 절대 update 하지 않고 항상 append.**
- 모든 데이터는 `leadId` 로 연결되며, 형식은 `DMS-YYYYMMDD-0001`.

## 운영 흐름 요약

1. 이름 로그인 → 2. 상담 접수 등록(상담접수/상담원본로그/리드마스터/리드스냅샷
로그/데이터변경로그/상태변경이력 동시 기록) → 3. 리드 마스터에서 단계·관리
필요도·계약 가능성·다음 액션 관리 → 4. 단계를 "보류"로 바꾸면 CRM재접촉 자동 등록
→ 5. 3·14·30일 기준 재접촉, 완료 시 고객 상태 선택 → 6. 고객 상태에 따라 리드
현재 단계 자동 변경 → 7. 계약완료/이탈/종료/삭제됨/비활성 리드는 아카이브(원본은
보존).

## 데이터 모드 / 보안

- **Mock(localStorage)**: 브라우저에서 service 로직을 직접 실행. 새로고침해도
  데이터 유지(같은 브라우저). 초기화하려면 브라우저 `localStorage` 의 `dms_crm:*`
  키를 지우면 됩니다.
- **Google Sheets**: 모든 시트 접근은 서버 API route(`/api/*`)에서만 수행하며,
  프론트엔드는 API 만 호출합니다. Google 자격증명은 클라이언트로 전달되지 않습니다.

## 폴더 구조

```
src/
├─ app/
│  ├─ login/                 이름 로그인
│  ├─ (crm)/                 사이드바 셸 + 로그인 가드
│  │  ├─ leads / consultations / follow-ups / customers/[leadId] / archive / settings
│  └─ api/                   서버 전용 API route (Google Sheets 처리)
├─ client/dataClient.ts      mock/real 분기 데이터 접근 계층 (프론트 전용)
├─ services/                 비즈니스 로직 (store 주입형, isomorphic)
│  ├─ googleSheetsService.ts (서버 전용)  mockStorageService.ts (클라이언트)
│  ├─ crmService.ts          교차 엔티티 오케스트레이션
│  ├─ leadService / consultationService / followUpService / archiveService
│  ├─ logService / historyService
├─ lib/                      types · constants · sheets schema · csv · 날짜/ID 유틸
├─ data/mockData.ts          초기 더미 데이터(10건) 시드
└─ components/               UI (사이드바/상단바/모달/테이블/토스트/프리미티브)
```
