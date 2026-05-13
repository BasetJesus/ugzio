import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getTodayOperations } from "@/services/operations.service";
import TodayOperationsPanel from "@/components/operations/TodayOperationsPanel";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const data = await getTodayOperations(orgId);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Today&apos;s Operations</h1>
          <p className="text-xs text-zinc-500 mt-0.5">What needs action right now</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          {data.systemState.lastComputed}
        </span>
      </div>

      <TodayOperationsPanel data={data} />
    </div>
  );
}
