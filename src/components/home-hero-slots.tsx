import type { ReactNode } from "react";
import Link from "next/link";
import type { HeroSlotView } from "@/lib/hero-slots";

export type HomeHeroSlotsLinkMode = "personalizar" | "vitrine" | "none";

function normalizeExternalUrl(u: string): string {
  const t = u.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

type Props = {
  slots: HeroSlotView[];
  linkMode: HomeHeroSlotsLinkMode;
  layout?: "stack" | "grid";
  /** Não mostrar slots sem imagem (tela principal, ver tudo, campeonatos). */
  hideEmpty?: boolean;
  showPersonalizarHint?: boolean;
};

function innerBlock(
  path: string,
  layout: "stack" | "grid",
  linkMode: HomeHeroSlotsLinkMode,
  showPersonalizarHint: boolean | undefined,
  slotIndex: number,
  hasExternalLink: boolean,
) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-black ring-2 ring-teal-500/30 transition ${
        layout === "stack"
          ? "aspect-[16/10] max-h-[min(52vh,36rem)] min-h-[200px]"
          : "aspect-[4/3]"
      } ${linkMode !== "none" && !hasExternalLink ? "group-hover:ring-teal-400/55" : ""} ${
        hasExternalLink ? "hover:ring-teal-400/55" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={path}
        alt=""
        className={`h-full w-full object-cover transition ${
          linkMode !== "none" && !hasExternalLink ? "group-hover:opacity-95" : ""
        } ${hasExternalLink ? "hover:opacity-95" : ""}`}
      />
      {linkMode === "personalizar" && showPersonalizarHint && !hasExternalLink ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/75 text-[11px] font-medium text-slate-200 opacity-0 transition group-hover:opacity-100 sm:text-sm">
          {slotIndex === 0 ? "Ver tudo" : "Editar"}
        </span>
      ) : null}
      {linkMode === "personalizar" && showPersonalizarHint && hasExternalLink ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100 sm:text-sm">
          Abrir link
        </span>
      ) : null}
      {linkMode === "vitrine" ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100 sm:text-sm">
          Ver
        </span>
      ) : null}
    </div>
  );
}

export function HomeHeroSlots({
  slots,
  linkMode,
  layout = "stack",
  hideEmpty = false,
  showPersonalizarHint,
}: Props) {
  const visible = hideEmpty ? slots.filter((s) => s.imagePath) : slots;

  const gridClass =
    layout === "grid"
      ? "grid w-full max-w-4xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
      : "flex w-full max-w-2xl flex-col items-stretch gap-14 md:gap-16";

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className={gridClass}>
      {visible.map((slot) => {
        const path = slot.imagePath!;
        const ext = normalizeExternalUrl(slot.linkUrl);
        const hasExternalLink = ext.length > 0;
        const inner = innerBlock(path, layout, linkMode, showPersonalizarHint, slot.slotIndex, hasExternalLink);

        const caption =
          slot.subtitle ? (
            <p className="mt-3 max-w-2xl text-center text-base text-slate-700 dark:text-slate-300">{slot.subtitle}</p>
          ) : null;

        if (layout === "grid") {
          let gridMain: ReactNode;
          if (hasExternalLink) {
            gridMain = (
              <a
                href={ext}
                target="_blank"
                rel="noopener noreferrer"
                className="group min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                {inner}
              </a>
            );
          } else {
            const href =
              linkMode === "personalizar"
                ? slot.slotIndex === 0
                  ? "/dashboard/ver-tudo"
                  : "/dashboard/personalizar"
                : linkMode === "vitrine"
                  ? "/dashboard/campeonatos/ver"
                  : undefined;
            if (href) {
              gridMain = (
                <Link
                  href={href}
                  className="group min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  {inner}
                </Link>
              );
            } else {
              gridMain = (
                <div className="min-w-0">
                  <div className="pointer-events-none select-none">{inner}</div>
                </div>
              );
            }
          }
          return (
            <div key={slot.slotIndex} className="flex min-w-0 flex-col items-center gap-2">
              {gridMain}
              {caption}
            </div>
          );
        }

        // stack
        const stackItem = (() => {
          if (hasExternalLink) {
            return (
              <a
                href={ext}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full max-w-2xl self-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                {inner}
              </a>
            );
          }
          if (linkMode === "personalizar") {
            const href = slot.slotIndex === 0 ? "/dashboard/ver-tudo" : "/dashboard/personalizar";
            return (
              <Link
                href={href}
                className="group block w-full max-w-2xl self-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                {inner}
              </Link>
            );
          }
          if (linkMode === "vitrine") {
            return (
              <Link
                href="/dashboard/campeonatos/ver"
                className="group block w-full max-w-2xl self-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                {inner}
              </Link>
            );
          }
          return (
            <div className="w-full max-w-2xl self-center">
              <div className="pointer-events-none select-none">{inner}</div>
            </div>
          );
        })();

        return (
          <div
            key={slot.slotIndex}
            className="flex w-full flex-col items-center border-b border-slate-200/80 pb-14 last:border-b-0 last:pb-0 dark:border-white/10"
          >
            {stackItem}
            {caption}
          </div>
        );
      })}
    </div>
  );
}
