"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateProfile, type UpdateProfileState } from "@/app/actions";
import type { UserRow } from "@/lib/db";
import { formatCPFDisplay } from "@/lib/cpf";
import { Loader2, Save } from "lucide-react";

const initial: UpdateProfileState = {};

type Props = {
  user: UserRow;
};

export function EditProfileForm({ user }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  return (
    <form action={formAction} className="space-y-8">
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
          Perfil atualizado.{" "}
          <Link href="/dashboard/perfil" className="font-semibold underline underline-offset-2">
            Ver perfil
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome completo</span>
          <input
            name="fullName"
            required
            autoComplete="name"
            defaultValue={user.full_name}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</span>
          <input
            type="email"
            readOnly
            value={user.email}
            className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 dark:border-white/10 dark:bg-zinc-950 dark:text-slate-400"
          />
          <span className="text-xs text-slate-500">O e-mail não pode ser alterado aqui.</span>
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">CPF</span>
          <input
            readOnly
            value={formatCPFDisplay(user.cpf)}
            className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 dark:border-white/10 dark:bg-zinc-950 dark:text-slate-400"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Telefone</span>
          <input
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            defaultValue={user.phone}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Faixa</span>
          <select
            name="faixa"
            required
            defaultValue={user.faixa}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="Branca">Branca</option>
            <option value="Azul">Azul</option>
            <option value="Roxa">Roxa</option>
            <option value="Marrom">Marrom</option>
            <option value="Preta">Preta</option>
            <option value="Coral">Coral</option>
            <option value="Vermelha">Vermelha</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Peso (kg)</span>
          <input
            name="peso"
            type="text"
            required
            inputMode="decimal"
            defaultValue={String(user.peso).replace(".", ",")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Idade</span>
          <input
            name="idade"
            type="number"
            required
            min={3}
            max={120}
            defaultValue={user.idade}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Academia</span>
          <input
            name="academia"
            required
            defaultValue={user.academia}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Gênero</span>
          <select
            name="gender"
            required
            defaultValue={user.gender}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
            <option value="Não-binário">Não-binário</option>
            <option value="Prefiro não informar">Prefiro não informar</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Foto de perfil (opcional)</span>
          {user.profile_image_path ? (
            <div className="mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.profile_image_path}
                alt=""
                className="h-24 w-24 rounded-2xl border border-slate-200 object-cover dark:border-white/10"
              />
            </div>
          ) : null}
          <input
            name="profileImage"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-500"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-teal-500 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
        <Link
          href="/dashboard/perfil"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/5"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
