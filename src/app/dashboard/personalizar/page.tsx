import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getUserHomeCustom } from "@/lib/queries";
import { parseHomeBlocks } from "@/lib/home-blocks";
import { getExtraImagePaths, getHeroSlotsView } from "@/lib/hero-slots";
import { HomePersonalizarForm } from "@/components/home-personalizar-form";

export default async function PersonalizarPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/cadastro");

  const row = await getUserHomeCustom(userId);
  const blocks = row ? parseHomeBlocks(row.blocks_json) : [];
  const initialSlots = getHeroSlotsView(row);
  const extraPathsInitial = getExtraImagePaths(row);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">Personalizar</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sua área na tela inicial</h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-400">
          Ajuste o título, o subtítulo e a imagem que aparecem na tela principal. Adicione blocos de link, foto ou data.
        </p>
        <Link
          href="/dashboard/principal"
          className="inline-block text-sm font-semibold text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
        >
          ← Voltar à tela principal
        </Link>
      </header>

      <HomePersonalizarForm
        heroTitle={row?.hero_title ?? ""}
        heroSubtitle={row?.hero_subtitle ?? ""}
        initialSlots={initialSlots}
        extraPathsInitial={extraPathsInitial}
        blocks={blocks}
      />
    </div>
  );
}
