import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getUserHomeCustom } from "@/lib/queries";
import { getHeroSlotsView } from "@/lib/hero-slots";
import { HomeHeroSlots } from "@/components/home-hero-slots";
import { Trophy } from "lucide-react";

export default async function CampeonatosPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/cadastro");

  const row = await getUserHomeCustom(userId);
  const slots = getHeroSlotsView(row);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">Competição</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Campeonatos</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          As mesmas imagens da tela principal (só as que tiverem foto), uma por secção. Toque para abrir a vitrine.
        </p>
      </header>

      <div className="flex flex-col items-center gap-6">
        <HomeHeroSlots slots={slots} linkMode="vitrine" layout="stack" hideEmpty />
        <Link
          href="/dashboard/campeonatos/ver"
          className="text-sm font-semibold text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
        >
          Abrir vitrine completa
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-8 py-12 text-center dark:border-white/15 dark:bg-zinc-900/40">
        <Trophy className="mb-3 h-10 w-10 text-amber-400/80" aria-hidden />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Calendário de eventos em breve</p>
        <p className="mt-1 max-w-md text-xs text-slate-600 dark:text-slate-400">
          Inscrições e chaves aparecerão aqui quando disponíveis.
        </p>
      </div>
    </div>
  );
}
