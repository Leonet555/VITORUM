import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getUserById } from "@/lib/queries";
import { EditProfileForm } from "@/components/edit-profile-form";

export default async function EditarPerfilPage() {
  const id = await getSessionUserId();
  if (!id) redirect("/cadastro");
  const user = await getUserById(id);
  if (!user) redirect("/cadastro");

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">Conta</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Editar perfil</h1>
        <p className="text-slate-600 dark:text-slate-400">Atualize seus dados e, se quiser, a foto de perfil.</p>
        <Link
          href="/dashboard/perfil"
          className="inline-block text-sm font-semibold text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
        >
          ← Voltar ao perfil
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/80 sm:p-8">
        <EditProfileForm user={user} />
      </div>
    </div>
  );
}
