import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/cadastro");
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-zinc-950">
      <DashboardSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
