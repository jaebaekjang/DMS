"use client";

import { useState } from "react";
import { data } from "@/client/dataClient";
import { USE_MOCK_DATA } from "@/lib/config";
import {
  CHANNEL_OPTIONS,
  DEFAULT_USERS,
  HOLD_REASON_OPTIONS,
  INDUSTRY_OPTIONS,
  ISSUE_TYPE_OPTIONS,
  OWNER_OPTIONS,
  REGION_OPTIONS,
  STAGE_OPTIONS,
} from "@/lib/constants";
import { downloadBackupZip } from "@/lib/export";
import { useToast } from "@/components/Toast";
import { useCurrentUserName } from "@/components/UserContext";
import { Badge, Button, Card, PageTitle } from "@/components/ui";

const OPTION_GROUPS: { title: string; items: readonly string[] }[] = [
  { title: "담당자 목록", items: OWNER_OPTIONS },
  { title: "자주 사용하는 로그인 이름", items: DEFAULT_USERS },
  { title: "업종 옵션", items: INDUSTRY_OPTIONS },
  { title: "지역 옵션", items: REGION_OPTIONS },
  { title: "문제 유형 옵션", items: ISSUE_TYPE_OPTIONS },
  { title: "유입 채널 옵션", items: CHANNEL_OPTIONS },
  { title: "보류 사유 옵션", items: HOLD_REASON_OPTIONS },
  { title: "현재 단계 옵션", items: STAGE_OPTIONS },
];

export default function SettingsPage() {
  const toast = useToast();
  const user = useCurrentUserName();
  const [initing, setIniting] = useState(false);
  const [backing, setBacking] = useState(false);

  async function initSheets() {
    setIniting(true);
    try {
      await data.ensureSheets();
      toast.success(
        USE_MOCK_DATA
          ? "Mock 저장소를 준비했습니다. (기존 데이터는 유지)"
          : "구글시트 탭/헤더를 준비했습니다. (기존 데이터는 유지)"
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "초기화에 실패했습니다.");
    } finally {
      setIniting(false);
    }
  }

  async function backup() {
    setBacking(true);
    try {
      const tabs = await data.getBackupData(user);
      await downloadBackupZip(tabs);
      toast.success("전체 데이터를 ZIP 으로 백업했습니다.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "백업에 실패했습니다.");
    } finally {
      setBacking(false);
    }
  }

  return (
    <div>
      <PageTitle title="설정" description="기본값, 구글시트 초기화, 전체 백업을 관리합니다." />

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-800">구글시트 초기화</h2>
          <p className="mt-1 text-sm text-gray-500">
            필요한 모든 탭과 헤더가 있는지 확인하고, 없는 것만 생성합니다. 기존
            데이터 행은 절대 삭제하지 않습니다. (덮어쓰기/초기화 아님)
          </p>
          <Button className="mt-3" onClick={initSheets} disabled={initing}>
            {initing ? "준비 중..." : "구글시트 초기화"}
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-800">전체 데이터 백업</h2>
          <p className="mt-1 text-sm text-gray-500">
            모든 탭(운영/로그/아카이브)을 탭별 CSV 로 만들어 ZIP 으로 다운로드합니다.
            백업 실행은 데이터변경로그에 EXPORT 로 기록됩니다.
          </p>
          <Button className="mt-3" onClick={backup} disabled={backing}>
            {backing ? "백업 중..." : "전체 데이터 백업 (ZIP)"}
          </Button>
        </Card>
      </div>

      <Card className="mb-5 p-5">
        <h2 className="text-sm font-semibold text-gray-800">데이터 모드</h2>
        <p className="mt-1 text-sm text-gray-500">
          현재 모드:{" "}
          <span className="font-semibold text-gray-800">
            {USE_MOCK_DATA ? "Mock (localStorage)" : "Google Sheets 연동"}
          </span>
          . 환경변수 <code className="rounded bg-gray-100 px-1">NEXT_PUBLIC_USE_MOCK_DATA</code>{" "}
          로 전환합니다. Google API 정보는 서버에서만 사용되며 프론트엔드에
          노출되지 않습니다.
        </p>
      </Card>

      <Card className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">운영 기본값 (옵션 목록)</h2>
          <span className="text-xs text-gray-400">
            현재는 코드 상수로 관리 — 추후 이 화면에서 편집 가능하도록 분리됨
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          {OPTION_GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-1.5 text-xs font-medium text-gray-600">{g.title}</div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((it) => (
                  <Badge key={it} tone="gray">{it}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
