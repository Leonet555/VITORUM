import { UsersRound } from "lucide-react";

export default function EquipesPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">Social</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Equipes</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Conecte-se com sua equipe e acompanhe treinos em conjunto.
        </p>
      </header>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-8 py-20 text-center dark:border-white/15 dark:bg-zinc-900/40">
        <UsersRound className="mb-4 h-14 w-14 text-teal-400/80" aria-hidden />
        <p className="text-lg font-medium text-slate-800 dark:text-slate-200">Equipes em construção</p>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Em breve você poderá ver colegas da mesma academia e convites.
        </p>
      </div>
    </div>
  );
}
