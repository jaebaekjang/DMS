"use client";

import { createContext, useContext } from "react";

// 현재 로그인한 사용자 이름 (모든 기록의 실행자로 사용)
export const UserContext = createContext<string>("");

export function useCurrentUserName(): string {
  return useContext(UserContext);
}
