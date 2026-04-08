import { notFound } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getCreation } from "@/lib/queries";
import { CreationForm } from "@/components/creation-form";

const titles: Record<1 | 2 | 3, { title: string; subtitle: string }> = {
  1: {
    title: "Conquistas",
    subtitle: "Adicione foto, link e data do seu momento especial.",
  },
  2: {
    title: "Metas",
    subtitle: "Defina referências visuais, materiais em link e um prazo.",
  },
  3: {
    title: "Agenda",
    subtitle: "Crie lembretes com imagem, URL e data livre.",
  },
};

type PageProps = {
  params: Promise<{ slot: string }>;
};

export default async function CriarPage({ params }: PageProps) {
  const { slot: slotStr } = await params;
  const n = Number.parseInt(slotStr, 10);
  if (n !== 1 && n !== 2 && n !== 3) notFound();

  const slot = n as 1 | 2 | 3;
  const userId = await getSessionUserId();
  if (!userId) notFound();

  const creation = await getCreation(userId, slot);
  const meta = titles[slot];

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">
          Criar conteúdo
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{meta.title}</h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-400">{meta.subtitle}</p>
      </header>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-800/50 to-slate-900/80 p-8 shadow-xl ring-1 ring-white/5 dark:from-slate-900/80 dark:to-zinc-950/90">
        <CreationForm
          slot={slot}
          initialImage={creation?.image_path ?? null}
          initialLink={creation?.link_url ?? null}
          initialDate={creation?.event_date ?? null}
        />
      </div>
    </div>
  );
}
