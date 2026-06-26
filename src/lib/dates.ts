// 날짜 관련 유틸. 모든 날짜는 KST 기준 YYYY-MM-DD / ISO 문자열로 다룬다.

export function nowIso(): string {
  return new Date().toISOString();
}

// YYYY-MM-DD (로컬 기준)
export function todayStr(): string {
  return toDateStr(new Date());
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// YYYY-MM-DD HH:mm
export function nowDateTimeStr(): string {
  const d = new Date();
  const date = toDateStr(d);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${date} ${h}:${min}`;
}

// 오늘 기준 N일 후의 YYYY-MM-DD
export function addDays(days: number, from?: string): string {
  const base = from ? new Date(from) : new Date();
  base.setDate(base.getDate() + days);
  return toDateStr(base);
}

// dateStr 이 오늘이거나 과거인지 (재접촉 지연/대상 판별)
export function isOnOrBeforeToday(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr <= todayStr();
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}
