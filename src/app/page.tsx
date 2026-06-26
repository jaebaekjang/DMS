import { redirect } from "next/navigation";

export default function Home() {
  // 로그인 여부는 (crm) 레이아웃에서 클라이언트로 판별 -> 미로그인 시 /login 으로 이동
  redirect("/leads");
}
