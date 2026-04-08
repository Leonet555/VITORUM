import Link from "next/link";
import { Award, Target, CalendarDays, ChevronRight } from "lucide-react";

const cards = [
  {
    slot: 1 as const,
    title: "Conquistas",
    description: "Registre fotos, links e datas das suas graduações e vitórias.",
    icon: Award,
    gradient: "from-amber-500/20 to-orange-600/10 ring-amber-400/30",
    accent: "text-amber-200",
  },
  {
    slot: 2 as const,
    title: "Metas",
    description: "Organize objetivos com imagem de referência, link útil e prazo.",
    icon: Target,
    gradient: "from-teal-500/20 to-cyan-600/10 ring-teal-400/30",
    accent: "text-teal-200",
  },
  {
    slot: 3 as const,
    title: "Agenda",
    description: "Monte lembretes visuais com foto, URL e data que você escolher.",
    icon: CalendarDays,
    gradient: "from-violet-500/20 to-indigo-600/10 ring-violet-400/30",
    accent: "text-violet-200",
  },
];

export default function PrincipalPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">Início</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tela principal</h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-400">
          Escolha uma das áreas abaixo para criar ou editar seu conteúdo. Cada espaço tem foto centralizada, link
          opcional e data personalizada.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map(({ slot, title, description, icon: Icon, gradient, accent }) => (
          <Link
            key={slot}
            href={`/dashboard/criar/${slot}`}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-6 shadow-lg ring-1 transition hover:-translate-y-0.5 hover:shadow-xl`}
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-black/20 ${accent}`}>
              <Icon className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">{description}</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-teal-300 group-hover:text-teal-200">
              Abrir
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
