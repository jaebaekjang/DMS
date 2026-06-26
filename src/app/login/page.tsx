"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { data } from "@/client/dataClient";
import { getCurrentUser, setCurrentUser } from "@/lib/auth";
import { DEFAULT_USERS } from "@/lib/constants";
import { useToast } from "@/components/Toast";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) router.replace("/leads");
  }, [router]);

  async function handleLogin() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      setCurrentUser(trimmed);
      await data.ensureSheets();
      await data.logAuth("LOGIN", trimmed);
      router.replace("/leads");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-lg font-bold text-brand">DM&apos;S CX 운영 CRM</div>
          <p className="mt-1 text-sm text-gray-500">이름을 입력해주세요.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <Input
            autoFocus
            placeholder="예: 장재백"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {DEFAULT_USERS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setName(u)}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 hover:border-brand hover:text-brand"
              >
                {u}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            className="mt-5 w-full"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-gray-400">
          로그인은 권한 제한이 아니라, 모든 기록에 실행자 이름을 남기기 위한
          용도입니다.
        </p>
      </div>
    </div>
  );
}
