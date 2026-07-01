// 간단한 고정 윈도우 레이트리미터 (인스턴스 메모리 기준). 스팸/봇 1차 차단용.
const buckets = new Map<string, { minute: number; count: number }>();

export function rateLimit(key: string, perMinute: number): boolean {
  const minute = Math.floor(Date.now() / 60_000);
  const cur = buckets.get(key);
  if (!cur || cur.minute !== minute) {
    buckets.set(key, { minute, count: 1 });
    return true;
  }
  cur.count += 1;
  return cur.count <= perMinute;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}
