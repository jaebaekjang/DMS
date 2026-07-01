import type { Metadata } from "next";
import Landing from "@/components/landing/Landing";
import { getConfig } from "@/lib/site/store";
import { toPublicConfig } from "@/lib/site/config";

// 사이트 설정(디자인/팝업/트래킹 ID)을 서버에서 읽어 최초 렌더에 반영
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return {
    title: `${config.design.brandName} | 매장 토탈케어 월 구독 서비스`,
    description: config.design.heroSubtitle,
    openGraph: {
      title: config.design.heroTitle,
      description: config.design.heroSubtitle,
    },
  };
}

export default async function Home() {
  const config = await getConfig();
  return <Landing config={toPublicConfig(config)} />;
}
