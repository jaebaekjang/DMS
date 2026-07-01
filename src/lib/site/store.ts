// ===== 서버 측 저장소 (Vercel KV / Upstash REST, 미설정 시 인메모리 폴백) =====
// Vercel 프로젝트에 KV(Upstash) 를 연결하면 KV_REST_API_URL / KV_REST_API_TOKEN 이
// 자동 주입되어 영구 저장된다. 미연결 시에는 인메모리로 동작(콜드스타트 시 초기화)하며,
// 이 경우에도 어드민 연동 설정의 웹훅으로 문의를 외부(CRM)에 전달해 유실을 막을 수 있다.

import { DEFAULT_CONFIG, mergeConfig, type SiteConfig } from "./config";

export type Inquiry = {
  id: string;
  createdAt: string;
  storeName: string;
  phone: string;
  region: string;
  issues: string[];
  industry: string;
  size: string;
  message: string;
  sourceUrl: string;
  ipHash: string;
  status: string;
};

const CONFIG_KEY = "dms:site-config";
const INQUIRY_KEY = "dms:inquiries";

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const kvEnabled = Boolean(KV_URL && KV_TOKEN);

// ---- 인메모리 폴백 ----
const mem: { config: SiteConfig | null; inquiries: Inquiry[] } = {
  config: null,
  inquiries: [],
};

async function kv(command: unknown[]): Promise<unknown> {
  const res = await fetch(KV_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV 오류 (${res.status})`);
  const json = (await res.json()) as { result?: unknown };
  return json.result;
}

// ===== 사이트 설정 =====
export async function getConfig(): Promise<SiteConfig> {
  if (kvEnabled) {
    try {
      const raw = (await kv(["GET", CONFIG_KEY])) as string | null;
      return mergeConfig(raw ? (JSON.parse(raw) as Partial<SiteConfig>) : null);
    } catch {
      return structuredClone(DEFAULT_CONFIG);
    }
  }
  return mem.config ?? structuredClone(DEFAULT_CONFIG);
}

export async function saveConfig(config: SiteConfig): Promise<void> {
  const merged = mergeConfig(config);
  if (kvEnabled) {
    await kv(["SET", CONFIG_KEY, JSON.stringify(merged)]);
  } else {
    mem.config = merged;
  }
}

// ===== 문의 =====
export async function addInquiry(inquiry: Inquiry): Promise<void> {
  if (kvEnabled) {
    await kv(["LPUSH", INQUIRY_KEY, JSON.stringify(inquiry)]);
    await kv(["LTRIM", INQUIRY_KEY, "0", "499"]); // 최근 500건 유지
  } else {
    mem.inquiries.unshift(inquiry);
    if (mem.inquiries.length > 500) mem.inquiries.length = 500;
  }
}

export async function listInquiries(): Promise<Inquiry[]> {
  if (kvEnabled) {
    try {
      const raw = (await kv(["LRANGE", INQUIRY_KEY, "0", "499"])) as string[] | null;
      return (raw ?? []).map((s) => JSON.parse(s) as Inquiry);
    } catch {
      return [];
    }
  }
  return mem.inquiries;
}

export const STORE_MODE = kvEnabled ? "kv" : "memory";
