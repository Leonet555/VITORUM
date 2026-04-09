import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getUserHomeCustom } from "@/lib/queries";
import { parseHomeBlocks } from "@/lib/home-blocks";
import { getHeroSlotsView } from "@/lib/hero-slots";
import { HomeHeroSlots } from "@/components/home-hero-slots";
import { HomeBlocksContent } from "@/components/home-blocks-content";

export default async function PrincipalPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/cadastro");

  const row = await getUserHomeCustom(userId);
  const heroTitle = (row?.hero_title ?? "").trim() || "Título";
  const heroSubtitle = (row?.hero_subtitle ?? "").trim();
  const slots = getHeroSlotsView(row);
  const blocks = row ? parseHomeBlocks(row.blocks_json) : [];

  return (
    <div className="space-y-12">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Bem vindo-(a) ao Vitorum!
        </h1>
      </header>

      <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white md:text-2xl">{heroTitle}</h2>
        {heroSubtitle ? (
          <p className="text-base text-slate-600 dark:text-slate-400">{heroSubtitle}</p>
        ) : null}

        <HomeHeroSlots slots={slots} linkMode="personalizar" layout="stack" hideEmpty showPersonalizarHint />

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-500">
          <Link
            href="/dashboard/ver-tudo"
            className="font-semibold text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
          >
            Ver tudo
          </Link>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden>
            |
          </span>
          <Link
            href="/dashboard/personalizar"
            className="font-medium text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
          >
            Personalizar conteúdo
          </Link>
        </div>
      </section>

      <HomeBlocksContent blocks={blocks} excludeTypes={["photo"]} />
    </div>
  );
}
