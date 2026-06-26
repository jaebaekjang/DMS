// CSV 생성 / 다운로드 유틸 (클라이언트, 서버 공용 직렬화)

function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// 헤더 + 행 데이터를 CSV 문자열로 변환
export function toCsv(headers: string[], rows: (string | number | boolean)[][]): string {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  // Excel 한글 깨짐 방지를 위해 BOM 포함
  return "﻿" + lines.join("\r\n");
}

// 객체 배열 -> CSV (지정한 컬럼 순서대로)
export function objectsToCsv<T extends Record<string, unknown>>(
  headers: string[],
  keys: (keyof T)[],
  items: T[]
): string {
  const rows = items.map((item) =>
    keys.map((k) => {
      const v = item[k];
      if (typeof v === "boolean") return v ? "예" : "아니오";
      return v === null || v === undefined ? "" : String(v);
    })
  );
  return toCsv(headers, rows);
}

// 브라우저에서 CSV 파일 다운로드
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(filename, blob);
}

export function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
