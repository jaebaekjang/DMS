"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "📥 문의 접수" },
  { href: "/admin/design", label: "🎨 디자인 수정" },
  { href: "/admin/popup", label: "🪧 팝업 설정" },
  { href: "/admin/integrations", label: "🔌 연동 설정" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-[#e7e7ea]">
      <aside className="w-56 shrink-0 border-r border-[#23262f] bg-[#15171d] p-4">
        <div className="px-2 pb-4 pt-1 text-lg font-extrabold text-[#FF7A1A]">DM&apos;S 어드민</div>
        <nav className="space-y-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`block rounded-lg px-3 py-2.5 text-sm ${
                  active ? "bg-[#FF7A1A]/20 text-white" : "text-[#cfcfd6] hover:bg-[#FF7A1A]/10"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <a href="/" target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2.5 text-sm text-[#cfcfd6] hover:bg-[#FF7A1A]/10">
            ↗ 랜딩페이지 보기
          </a>
        </nav>
        <div className="mt-4 border-t border-[#23262f] pt-4">
          <button onClick={logout} className="w-full rounded-lg border border-[#2a2d36] px-3 py-2 text-sm text-[#cfcfd6] hover:bg-[#23262f]">
            로그아웃
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

// 공통 입력 스타일
export const fieldCls =
  "w-full rounded-lg border border-[#2a2d36] bg-[#0f1115] px-3 py-2.5 text-sm text-[#e7e7ea] outline-none focus:border-[#FF7A1A]";
export const cardCls = "mb-4 rounded-xl border border-[#23262f] bg-[#15171d] p-6";
export const btnCls = "rounded-lg bg-[#FF7A1A] px-5 py-2.5 text-sm font-bold text-[#1a1209] hover:bg-[#E25E00]";
