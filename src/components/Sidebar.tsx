"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

const NAV = [
  { href: "/leads", label: "리드 마스터", icon: "📋" },
  { href: "/consultations", label: "상담 접수", icon: "📝" },
  { href: "/follow-ups", label: "CRM 재접촉", icon: "🔁" },
  { href: "/archive", label: "아카이브 관리", icon: "🗄️" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="text-sm font-bold leading-tight text-brand">
          DM&apos;S CX
        </div>
        <div className="text-xs text-gray-500">운영 CRM</div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 px-4 py-3 text-[11px] leading-relaxed text-gray-400">
        모든 기록은 구글시트에 영구 보존됩니다.
      </div>
    </aside>
  );
}
