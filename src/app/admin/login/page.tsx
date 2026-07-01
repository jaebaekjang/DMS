"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.replace(params.get("next") || "/admin");
      } else {
        setError(data.message || "로그인에 실패했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1115] px-4 text-[#e7e7ea]">
      <div className="w-full max-w-sm rounded-2xl border border-[#23262f] bg-[#15171d] p-8">
        <h1 className="mb-5 text-center text-lg font-extrabold text-[#FF7A1A]">DM&apos;S 어드민</h1>
        {error && <div className="mb-3 rounded-lg border border-[#6b2f2f] bg-[#ff7a7a]/10 px-3 py-2 text-sm text-[#ff9c9c]">{error}</div>}
        <form onSubmit={onSubmit}>
          <label className="mb-1 block text-sm text-[#c4c4cc]">비밀번호</label>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-lg border border-[#2a2d36] bg-[#0f1115] px-3 py-2.5 text-sm outline-none focus:border-[#FF7A1A]"
          />
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#FF7A1A] px-5 py-2.5 text-sm font-bold text-[#1a1209] hover:bg-[#E25E00] disabled:opacity-60">
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-[#9a9aa3]">비밀번호는 서버 환경변수(ADMIN_PASSWORD)로 관리됩니다.</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
