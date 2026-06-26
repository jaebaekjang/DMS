"use client";

import { useRouter } from "next/navigation";
import { data } from "@/client/dataClient";
import { clearCurrentUser } from "@/lib/auth";
import { Button } from "./ui";

export function Topbar({ userName }: { userName: string }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await data.logAuth("LOGOUT", userName);
    } catch {
      // 로그아웃 기록 실패해도 로그아웃은 진행
    }
    clearCurrentUser();
    router.replace("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-gray-200 bg-white px-6">
      <span className="text-sm text-gray-600">
        로그인 사용자: <span className="font-semibold text-gray-900">{userName}</span>
      </span>
      <Button variant="secondary" size="sm" onClick={handleLogout}>
        로그아웃
      </Button>
    </header>
  );
}
