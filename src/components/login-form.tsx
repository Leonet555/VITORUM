"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginUser, type LoginState } from "@/app/actions";
import { Loader2, LogIn } from "lucide-react";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginUser, initial);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
        >
          {state.error}
        </div>
      ) : null}

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
        >
          Cadastrar
        </Link>
      </p>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome completo</span>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Igual ao cadastro"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:from-teal-500 hover:to-emerald-500 disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Entrando…
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" aria-hidden />
            Entrar
          </>
        )}
      </button>
    </form>
  );
}
