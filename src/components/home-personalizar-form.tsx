"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { saveHomeCustom, type SaveHomeCustomState } from "@/app/actions";
import type { HomeBlock } from "@/lib/home-blocks";
import type { HeroSlotView } from "@/lib/hero-slots";
import { Loader2, Link2, ImageIcon, Calendar, Trash2 } from "lucide-react";

const initialState: SaveHomeCustomState = {};

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `b-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const SLOT_FIELDS: { file: string; removeHidden: string; label: string }[] = [
  { file: "heroImage", removeHidden: "removeHeroImage", label: "Imagem 1" },
  { file: "heroImage2", removeHidden: "removeHeroImage2", label: "Imagem 2" },
  { file: "heroImage3", removeHidden: "removeHeroImage3", label: "Imagem 3" },
  { file: "heroImage4", removeHidden: "removeHeroImage4", label: "Imagem 4" },
];

type Props = {
  heroTitle: string;
  heroSubtitle: string;
  initialSlots: HeroSlotView[];
  extraPathsInitial: string[];
  blocks: HomeBlock[];
};

export function HomePersonalizarForm({
  heroTitle,
  heroSubtitle,
  initialSlots,
  extraPathsInitial,
  blocks: initialBlocks,
}: Props) {
  const [state, formAction, pending] = useActionState(saveHomeCustom, initialState);
  const [heroTitleState, setHeroTitleState] = useState(heroTitle);
  const [heroSubtitleState, setHeroSubtitleState] = useState(heroSubtitle);
  const [slotSub, setSlotSub] = useState(() => initialSlots.map((s) => s.subtitle));
  const [slotLink, setSlotLink] = useState(() => initialSlots.map((s) => s.linkUrl));
  const [blocks, setBlocks] = useState<HomeBlock[]>(initialBlocks);
  const [stripSlot, setStripSlot] = useState([false, false, false, false]);
  const [extras, setExtras] = useState<string[]>(extraPathsInitial);
  const [extraFileKeys, setExtraFileKeys] = useState<string[]>([]);

  const blocksJson = useMemo(() => JSON.stringify(blocks), [blocks]);
  const extraImagesJson = useMemo(() => JSON.stringify(extras), [extras]);

  function addBlock(type: HomeBlock["type"]) {
    const id = newId();
    if (type === "link") {
      setBlocks((b) => [...b, { id, type: "link", label: "Novo link", url: "https://" }]);
    } else if (type === "photo") {
      setBlocks((b) => [...b, { id, type: "photo", label: "Nova foto", image_path: "" }]);
    } else {
      setBlocks((b) => [...b, { id, type: "date", label: "Lembrete", date: "" }]);
    }
  }

  function removeBlock(id: string) {
    setBlocks((b) => b.filter((x) => x.id !== id));
  }

  function updateBlock(id: string, patch: Partial<HomeBlock>) {
    setBlocks((b) =>
      b.map((x) => {
        if (x.id !== id) return x;
        return { ...x, ...patch } as HomeBlock;
      }),
    );
  }

  return (
    <form action={formAction} className="space-y-10">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
        >
          {state.error}
        </div>
      ) : null}
      {state?.ok ? (
        <div className="rounded-xl border border-teal-400/40 bg-teal-500/10 px-4 py-3 text-sm text-teal-100">
          Alterações salvas.{" "}
          <Link href="/dashboard/principal" className="font-semibold underline underline-offset-2">
            Ver tela principal
          </Link>
        </div>
      ) : null}

      <input type="hidden" name="blocksJson" value={blocksJson} readOnly />
      <input type="hidden" name="extraImagesJson" value={extraImagesJson} readOnly />
      {SLOT_FIELDS.map((s, i) => (
        <input key={s.removeHidden} type="hidden" name={s.removeHidden} value={stripSlot[i] ? "1" : "0"} readOnly />
      ))}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Título e texto de apoio</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          O título aparece no topo da área. O subtítulo geral fica abaixo do título; cada foto pode ter seu próprio texto
          e link na secção seguinte. Use o bloco <strong>Data</strong> nos extras para datas na tela principal.
        </p>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Título</span>
          <input
            name="heroTitle"
            value={heroTitleState}
            onChange={(e) => setHeroTitleState(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Subtítulo geral (opcional)</span>
          <input
            name="heroSubtitle"
            value={heroSubtitleState}
            onChange={(e) => setHeroSubtitleState(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quatro posições de imagem</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cada posição é independente: legenda por baixo da foto quando existir imagem; se preencher o link, ao tocar na
            foto abre esse endereço (senão, a 1ª foto sem link abre &quot;Ver tudo&quot; e as outras abrem esta página de
            edição).
          </p>
        </div>
        <div className="flex flex-col gap-10">
          {SLOT_FIELDS.map((slot, i) => {
            const path = stripSlot[i] ? null : initialSlots[i]?.imagePath ?? null;
            const showImg = Boolean(path);
            return (
              <div
                key={slot.file}
                className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-white/5 dark:bg-zinc-950/40"
              >
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{slot.label}</p>
                <div className="relative aspect-[16/10] max-h-64 w-full overflow-hidden rounded-xl bg-black">
                  {showImg && path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={path} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Enviar imagem</span>
                  <input
                    name={slot.file}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-teal-500"
                  />
                </label>
                {path ? (
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={stripSlot[i]}
                      onChange={(e) => {
                        const next = [...stripSlot];
                        next[i] = e.target.checked;
                        setStripSlot(next);
                      }}
                    />
                    Remover imagem (preto)
                  </label>
                ) : null}
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Legenda (abaixo da foto)</span>
                  <input
                    name={`slotSubtitle${i}`}
                    value={slotSub[i]}
                    onChange={(e) => {
                      const n = [...slotSub];
                      n[i] = e.target.value;
                      setSlotSub(n);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                    placeholder="Opcional"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Link ao tocar na foto</span>
                  <input
                    name={`slotLink${i}`}
                    value={slotLink[i]}
                    onChange={(e) => {
                      const n = [...slotLink];
                      n[i] = e.target.value;
                      setSlotLink(n);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                    placeholder="https:// ou vazio"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mais imagens (opcional)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Aparecem em <strong>Ver tudo</strong> junto com o restante conteúdo. Não ocupam a tela principal.
        </p>
        <ul className="space-y-3">
          {extras.map((p) => (
            <li
              key={p}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-zinc-950/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-16 w-24 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setExtras((x) => x.filter((q) => q !== p))}
                className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        {extraFileKeys.map((key) => (
          <div key={key} className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-200 p-3 dark:border-white/10">
            <input
              name={`extraNew_${key}`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="text-sm text-slate-600 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
            />
            <button
              type="button"
              onClick={() => setExtraFileKeys((k) => k.filter((x) => x !== key))}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            >
              Cancelar campo
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setExtraFileKeys((k) => [...k, newId()])}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
        >
          + Adicionar envio de imagem
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Blocos extras</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Links e datas aparecem na tela principal. As <strong>fotos</strong> desta seção só aparecem quando você toca
              na primeira imagem e abre <strong>Ver tudo</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addBlock("link")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              <Link2 className="h-3.5 w-3.5" />
              Link
            </button>
            <button
              type="button"
              onClick={() => addBlock("photo")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Foto
            </button>
            <button
              type="button"
              onClick={() => addBlock("date")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              <Calendar className="h-3.5 w-3.5" />
              Data
            </button>
          </div>
        </div>

        <ul className="space-y-4">
          {blocks.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
              Nenhum bloco. Use os botões acima para adicionar.
            </li>
          ) : null}
          {blocks.map((block) => (
            <li
              key={block.id}
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/5 dark:bg-zinc-950/50"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                  {block.type === "link" ? "Link" : block.type === "photo" ? "Foto" : "Data"}
                </span>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </button>
              </div>

              {block.type === "link" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Rótulo</span>
                    <input
                      value={block.label}
                      onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                    />
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">URL</span>
                    <input
                      value={block.url}
                      onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                      placeholder="https://"
                    />
                  </label>
                </div>
              ) : null}

              {block.type === "photo" ? (
                <div className="space-y-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Rótulo</span>
                    <input
                      value={block.label}
                      onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                    />
                  </label>
                  {block.image_path ? (
                    <div className="relative max-h-40 max-w-xs overflow-hidden rounded-lg bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.image_path} alt="" className="max-h-40 w-auto object-contain" />
                    </div>
                  ) : null}
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Arquivo de imagem</span>
                    <input
                      name={`block_image_${block.id}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                    />
                  </label>
                </div>
              ) : null}

              {block.type === "date" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Rótulo</span>
                    <input
                      value={block.label}
                      onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Data</span>
                    <input
                      type="date"
                      value={block.date}
                      onChange={(e) => updateBlock(block.id, { date: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                    />
                  </label>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-teal-500 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {pending ? "Salvando…" : "Salvar tudo"}
        </button>
        <Link
          href="/dashboard/principal"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/5"
        >
          Voltar
        </Link>
      </div>
    </form>
  );
}
