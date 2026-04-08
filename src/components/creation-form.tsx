"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCreation, type SaveCreationState } from "@/app/actions";
import { Calendar, Link2, ImagePlus, CheckCircle2, Loader2 } from "lucide-react";

type Props = {
  slot: 1 | 2 | 3;
  initialImage: string | null;
  initialLink: string | null;
  initialDate: string | null;
};

const initial: SaveCreationState = {};

export function CreationForm({ slot, initialImage, initialLink, initialDate }: Props) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(initialImage);
  const [state, formAction, pending] = useActionState(saveCreation, initial);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-10">
      <input type="hidden" name="slot" value={slot} />

      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
        >
          {state.error}
        </div>
      ) : null}

      {state?.ok ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
          Alterações salvas com sucesso.
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex min-h-[280px] w-full max-w-[400px] items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/90 p-6 shadow-inner ring-1 ring-white/5">
          {preview ? (
            <div className="relative flex h-[260px] w-full items-center justify-center overflow-hidden rounded-2xl ring-2 ring-teal-500/40">
              <img src={preview} alt="Pré-visualização" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center text-slate-400">
              <ImagePlus className="h-14 w-14 opacity-50" aria-hidden />
              <p className="text-sm">Nenhuma imagem ainda. Escolha um arquivo abaixo.</p>
            </div>
          )}
        </div>

        <label className="flex w-full max-w-md cursor-pointer flex-col items-center gap-2">
          <span className="text-sm font-medium text-slate-200">Foto (centralizada na área acima)</span>
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-500"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) {
                setPreview(initialImage);
                return;
              }
              setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Link2 className="h-4 w-4 text-teal-400" aria-hidden />
          Link externo (opcional)
        </span>
        <input
          name="linkUrl"
          type="url"
          defaultValue={initialLink ?? ""}
          placeholder="https://"
          className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none ring-teal-500/0 transition focus:border-teal-500/60 focus:ring-4 focus:ring-teal-500/15"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Calendar className="h-4 w-4 text-teal-400" aria-hidden />
          Data
        </span>
        <input
          name="eventDate"
          type="date"
          defaultValue={initialDate ?? ""}
          className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-teal-500/60 focus:ring-4 focus:ring-teal-500/15"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-4 text-base font-semibold text-white shadow-lg shadow-teal-900/40 transition hover:from-teal-500 hover:to-emerald-500 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Salvando…
          </>
        ) : (
          "Salvar"
        )}
      </button>
    </form>
  );
}
