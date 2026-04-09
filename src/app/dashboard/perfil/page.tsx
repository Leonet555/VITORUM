import Link from "next/link";
import { getSessionUserId } from "@/lib/session";
import { getUserById } from "@/lib/queries";
import { redirect } from "next/navigation";
import { formatCPFDisplay } from "@/lib/cpf";
import { Mail, Phone, Scale, Cake, Building2, User, IdCard, Award, Pencil } from "lucide-react";

export default async function PerfilPage() {
  const id = await getSessionUserId();
  if (!id) redirect("/cadastro");
  const user = await getUserById(id);
  if (!user) redirect("/cadastro");

  const rows = [
    { label: "Nome completo", value: user.full_name, icon: User },
    { label: "E-mail", value: user.email, icon: Mail },
    { label: "CPF", value: formatCPFDisplay(user.cpf), icon: IdCard },
    { label: "Telefone", value: user.phone, icon: Phone },
    { label: "Faixa", value: user.faixa, icon: Award },
    { label: "Peso", value: `${user.peso} kg`, icon: Scale },
    { label: "Idade", value: `${user.idade} anos`, icon: Cake },
    { label: "Academia", value: user.academia, icon: Building2 },
    { label: "Gênero", value: user.gender, icon: User },
  ] as const;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">Conta</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Perfil</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Dados informados no cadastro.</p>
        </div>
        <Link
          href="/dashboard/perfil/editar"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-teal-500"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Editar perfil
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
        <dl className="divide-y divide-slate-100 dark:divide-white/10">
          {rows.map(({ label, value, icon: Icon }) => (
            <div key={label} className="grid gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] sm:items-center">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                {label}
              </dt>
              <dd className="text-base text-slate-900 dark:text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
