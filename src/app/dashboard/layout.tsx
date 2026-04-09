import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getUserById } from "@/lib/queries";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/cadastro");
  }

  const user = await getUserById(userId);
  if (!user) {
    redirect("/cadastro");
  }

  return (
    <DashboardShell displayName={user.full_name} avatarUrl={user.profile_image_path}>
      {children}
    </DashboardShell>
  );
}
