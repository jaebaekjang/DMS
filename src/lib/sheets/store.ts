// 데이터 저장소 추상화. 비즈니스 로직(services)은 이 인터페이스에만 의존하고,
// 실제 구현(Google Sheets / localStorage)은 주입받는다.

import type { TabName } from "./schema";

export interface SheetStore {
  // 모든 탭/헤더 준비 (없으면 생성, 기존 데이터는 유지)
  ensureSheets(): Promise<void>;
  // 탭의 데이터 행 (헤더 제외) 반환
  readTab(tab: TabName): Promise<string[][]>;
  // 탭 끝에 행 추가 (append 전용)
  appendRows(tab: TabName, rows: string[][]): Promise<void>;
  // 특정 컬럼 값이 일치하는 행을 찾아 업데이트. 성공 여부 반환.
  updateRowByColumn(
    tab: TabName,
    columnIndex: number,
    matchValue: string,
    values: string[]
  ): Promise<boolean>;
}
