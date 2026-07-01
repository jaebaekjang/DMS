// ===== 랜딩 사이트 설정 (디자인 / 팝업 / 공개 트래킹 ID / 알림 대상) =====
// 공개되어도 안전한 값만 담는다. 비밀값(알림톡 API 키, Meta CAPI 토큰 등)은
// 절대 여기 두지 않고 서버 환경변수로만 관리한다.

export type SiteDesign = {
  primaryColor: string;
  primaryDark: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  ctaLabel: string;
  floatingLabel: string;
  privacyNote: string;
};

export type SitePopup = {
  enabled: boolean;
  title: string;
  body: string;
  imageUrl: string;
  linkUrl: string;
  buttonLabel: string;
  hideForDays: number;
};

export type SiteTracking = {
  ga4MeasurementId: string;
  metaPixelId: string;
};

export type SiteNotify = {
  alimtalkEnabled: boolean;
  smsEnabled: boolean;
  adminPhone: string;
  alimtalkTemplateId: string;
  webhookUrl: string;
};

export type SiteFormOptions = {
  regions: string[];
  issues: string[];
  industries: string[];
  sizes: string[];
};

export type SiteConfig = {
  design: SiteDesign;
  popup: SitePopup;
  tracking: SiteTracking;
  notify: SiteNotify;
  formOptions: SiteFormOptions;
};

export const DEFAULT_CONFIG: SiteConfig = {
  design: {
    primaryColor: "#FF7A1A",
    primaryDark: "#E25E00",
    bgColor: "#0B0B0D",
    surfaceColor: "#16161A",
    textColor: "#F5F5F7",
    mutedColor: "#A1A1AA",
    brandName: "DM'S",
    heroTitle: "기존 방역비로, 설비·청소까지 관리받는 월 구독 서비스",
    heroSubtitle:
      "벌레, 냄새, 후드, 배수구, 에어컨, 현장점검, 설비 문제까지 한 번에 관리해드립니다.",
    formTitle: "무료 상담 신청",
    formSubtitle:
      "접수해주신 내용을 전문가가 검토한 후, 매장 상황에 맞는 상담을 위해 빠르게 전화드립니다.",
    ctaLabel: "무료 상담 신청하기",
    floatingLabel: "💬 무료 상담 신청",
    privacyNote: "입력하신 정보는 상담 용도로만 사용되며, 안전하게 보호됩니다.",
  },
  popup: {
    enabled: false,
    title: "DM'S 월 구독 이벤트",
    body: "지금 상담 신청하시면 첫 달 정기점검을 무료로 제공해드립니다.",
    imageUrl: "",
    linkUrl: "#inquiry",
    buttonLabel: "상담 신청하러 가기",
    hideForDays: 1,
  },
  tracking: {
    ga4MeasurementId: "",
    metaPixelId: "",
  },
  notify: {
    alimtalkEnabled: false,
    smsEnabled: false,
    adminPhone: "",
    alimtalkTemplateId: "",
    webhookUrl: "",
  },
  formOptions: {
    regions: ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "기타"],
    issues: [
      "벌레/해충",
      "하수구 막힘 및 역류",
      "악취",
      "누수",
      "화장실 문제",
      "수도/수전 문제",
      "후드 청소 및 주방 시설",
      "바닥 찌든 때 제거",
      "에어컨 분해 세척",
      "매장 전체 관리",
    ],
    industries: ["음식점", "요리주점", "카페", "미용실/네일샵/뷰티샵", "편의점/리테일 매장", "기타"],
    sizes: [
      "10평 미만",
      "10평 이상~20평 미만",
      "20평 이상~30평 미만",
      "30평 이상~50평 미만",
      "50평 이상",
    ],
  },
};

// 공개(브라우저 노출) 가능한 설정만 추린 형태. notify(관리자 번호/웹훅)는 제외한다.
export type PublicSiteConfig = Pick<
  SiteConfig,
  "design" | "popup" | "tracking" | "formOptions"
>;

export function toPublicConfig(config: SiteConfig): PublicSiteConfig {
  return {
    design: config.design,
    popup: config.popup,
    tracking: config.tracking,
    formOptions: config.formOptions,
  };
}

// 부분 설정을 기본값과 병합 (저장소에 일부만 있어도 안전)
export function mergeConfig(partial: Partial<SiteConfig> | null | undefined): SiteConfig {
  if (!partial) return structuredClone(DEFAULT_CONFIG);
  return {
    design: { ...DEFAULT_CONFIG.design, ...(partial.design ?? {}) },
    popup: { ...DEFAULT_CONFIG.popup, ...(partial.popup ?? {}) },
    tracking: { ...DEFAULT_CONFIG.tracking, ...(partial.tracking ?? {}) },
    notify: { ...DEFAULT_CONFIG.notify, ...(partial.notify ?? {}) },
    formOptions: { ...DEFAULT_CONFIG.formOptions, ...(partial.formOptions ?? {}) },
  };
}
