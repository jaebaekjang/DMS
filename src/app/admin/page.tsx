import AdminShell from "@/components/admin/AdminShell";
import { listInquiries, STORE_MODE } from "@/lib/site/store";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const inquiries = await listInquiries();

  return (
    <AdminShell>
      <h1 className="text-xl font-bold">문의 접수</h1>
      <p className="mb-5 mt-1 text-sm text-[#9a9aa3]">랜딩페이지로 접수된 무료 상담 신청 내역입니다.</p>

      <div className="mb-4 rounded-xl border border-[#23262f] bg-[#15171d] p-6">
        <div className="text-sm text-[#9a9aa3]">총 접수</div>
        <div className="text-3xl font-bold">{inquiries.length}</div>
        {STORE_MODE === "memory" && (
          <p className="mt-3 text-xs text-[#e0a34a]">
            ⚠️ 저장소가 인메모리 모드입니다. Vercel KV 를 연결하면 문의가 영구 저장됩니다.
            (미연결 시 재배포/콜드스타트에 데이터가 초기화되니, 연동 설정의 CRM 웹훅/알림톡을 함께 사용하세요.)
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#23262f] bg-[#15171d] p-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#9a9aa3]">
              <th className="p-3">접수일시</th><th className="p-3">매장명</th><th className="p-3">연락처</th>
              <th className="p-3">지역</th><th className="p-3">업종</th><th className="p-3">평수</th>
              <th className="p-3">현재 문제</th><th className="p-3">문의 내용</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-[#9a9aa3]">아직 접수된 문의가 없습니다.</td></tr>
            )}
            {inquiries.map((q) => (
              <tr key={q.id} className="border-t border-[#23262f] align-top">
                <td className="p-3 whitespace-nowrap">{q.createdAt.slice(0, 16).replace("T", " ")}</td>
                <td className="p-3">{q.storeName}</td>
                <td className="p-3 whitespace-nowrap">{q.phone}</td>
                <td className="p-3">{q.region}</td>
                <td className="p-3">{q.industry}</td>
                <td className="p-3">{q.size}</td>
                <td className="p-3">{q.issues.join(", ")}</td>
                <td className="p-3 text-[#9a9aa3]">{q.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
