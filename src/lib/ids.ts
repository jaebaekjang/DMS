import { toDateStr } from "./dates";

// 짧은 랜덤 토큰 (내부 id 용)
function randToken(): string {
  return Math.random().toString(36).slice(2, 8);
}

// 범용 내부 id
export function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${randToken()}`;
}

// leadId: DMS-YYYYMMDD-0001 형태 (날짜 + 순번)
// existingLeadIds 를 받아 같은 날짜의 순번을 계산한다.
export function genLeadId(existingLeadIds: string[]): string {
  const datePart = toDateStr(new Date()).replace(/-/g, "");
  const prefix = `DMS-${datePart}-`;
  let max = 0;
  for (const id of existingLeadIds) {
    if (id && id.startsWith(prefix)) {
      const seq = parseInt(id.slice(prefix.length), 10);
      if (!Number.isNaN(seq) && seq > max) max = seq;
    }
  }
  const next = String(max + 1).padStart(4, "0");
  return `${prefix}${next}`;
}
