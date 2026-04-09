import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getUserHomeCustom } from "@/lib/queries";
import { parseHomeBlocks } from "@/lib/home-blocks";
import { getExtraImagePaths, getHeroSlotsView } from "@/lib/hero-slots";
import { HomeHeroSlots } from "@/components/home-hero-slots";
import { HomeBlocksContent } from "@/components/home-blocks-content";
import { ExtraImagesGrid } from "@/components/extra-images-grid";

export default async function VerTudoPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/cadastro");

  const row = await getUserHomeCustom(userId);
  const heroTitle = (row?.hero_title ?? "").trim() || "Título";
  const heroSubtitle = (row?.hero_subtitle ?? "").trim();
  const slots = getHeroSlotsView(row);
  const extras = getExtraImagePaths(row);
  const blocks = row ? parseHomeBlocks(row.blocks_json) : [];

  const hasHeroVisual = slots.some((s) => s.imagePath);
  const hasExtras = extras.length > 0;
  const hasBlockContent = blocks.length > 0;

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">Ver tudo</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">{heroTitle}</h1>
        {heroSubtitle ? <p className="text-slate-600 dark:text-slate-400">{heroSubtitle}</p> : null}
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Só o que você adicionou: sem espaços pretos vazios. Links nos blocos abrem normalmente; o resto é só leitura.
        </p>
        <Link
          href="/dashboard/principal"
          className="inline-block text-sm font-semibold text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
        >
          ← Voltar à tela principal
        </Link>
      </header>

      {hasHeroVisual ? (
        <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
          <HomeHeroSlots slots={slots} linkMode="none" layout="stack" hideEmpty />
        </section>
      ) : null}

      {hasExtras ? <ExtraImagesGrid paths={extras} /> : null}

      {hasBlockContent ? (
        <HomeBlocksContent blocks={blocks} viewOnlyExceptLinks />
      ) : !hasHeroVisual && !hasExtras ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Ainda não há imagens nem blocos. Personalize a página inicial para adicionar conteúdo.
        </p>
      ) : null}
    </div>
  );
}
