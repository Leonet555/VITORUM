type Props = {
  paths: string[];
};

export function ExtraImagesGrid({ paths }: Props) {
  if (paths.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Mais imagens
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {paths.map((src) => (
          <div key={src} className="overflow-hidden rounded-xl border border-slate-200 bg-black/40 dark:border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="mx-auto max-h-80 w-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
