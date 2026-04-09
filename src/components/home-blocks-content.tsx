import type { HomeBlock } from "@/lib/home-blocks";
import { ExternalLink, ImageIcon, Calendar } from "lucide-react";

type BlockType = HomeBlock["type"];

type Props = {
  blocks: HomeBlock[];
  /** Só links abrem; fotos e datas são só leitura (vitrine campeonatos). */
  viewOnlyExceptLinks?: boolean;
  /** Tipos omitidos da lista (ex.: ocultar fotos na tela principal). */
  excludeTypes?: BlockType[];
};

export function HomeBlocksContent({ blocks, viewOnlyExceptLinks, excludeTypes }: Props) {
  const list = excludeTypes?.length ? blocks.filter((b) => !excludeTypes.includes(b.type)) : blocks;
  if (list.length === 0) return null;

  const staticWrap = viewOnlyExceptLinks ? "pointer-events-none select-none" : "";

  return (
    <section className="mx-auto w-full max-w-xl space-y-4">
      <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Seus conteúdos
      </h3>
      <ul className="flex flex-col gap-3">
        {list.map((block) => {
          if (block.type === "link") {
            const href = block.url?.trim() || "#";
            return (
              <li key={block.id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-900 dark:text-teal-300 dark:hover:bg-zinc-800"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  {block.label || "Link"}
                </a>
              </li>
            );
          }
          if (block.type === "photo") {
            return (
              <li
                key={block.id}
                className={`overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900/80 ${staticWrap}`}
              >
                <p className="mb-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  {block.label || "Foto"}
                </p>
                {block.image_path ? (
                  <div className="relative mx-auto max-h-64 overflow-hidden rounded-lg bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.image_path} alt="" className="mx-auto max-h-64 w-auto object-contain" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 py-8 text-sm text-slate-500 dark:bg-zinc-950 dark:text-slate-400">
                    <ImageIcon className="h-5 w-5" aria-hidden />
                    Sem imagem
                  </div>
                )}
              </li>
            );
          }
          if (block.type === "date") {
            return (
              <li
                key={block.id}
                className={`flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-slate-100 ${staticWrap}`}
              >
                <Calendar className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                <span className="font-medium">{block.label || "Data"}</span>
                {block.date ? (
                  <time className="text-slate-600 dark:text-slate-400">
                    {new Date(block.date + "T12:00:00").toLocaleDateString("pt-BR")}
                  </time>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </li>
            );
          }
          return null;
        })}
      </ul>
    </section>
  );
}
