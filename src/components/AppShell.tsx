"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { data } from "@/client/dataClient";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { UserContext } from "./UserContext";

// 로그인 가드 + 사이드바/상단바 셸. 로그인하지 않은 사용자는 /login 으로 이동.
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const name = getCurrentUser();
    if (!name) {
      router.replace("/login");
      return;
    }
    setUser(name);
    setChecked(true);
    // mock mode: 최초 시드 / real mode: no-op (init 은 설정에서)
    data.ensureSheets().catch(() => {});
  }, [router]);

  if (!checked || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-400">
        불러오는 중...
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar userName={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
