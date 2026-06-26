// 이름 기반 로그인 (localStorage). 권한 제한이 아니라 "누가 실행했는지" 기록용.

const KEY = "currentUserName";

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setCurrentUser(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, name);
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
