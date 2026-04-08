import { Dumbbell } from "lucide-react";
import { RegisterForm } from "@/components/register-form";

export default function CadastroPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20, 184, 166, 0.35), transparent), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(59, 130, 246, 0.12), transparent)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-teal-500/15 p-4 text-teal-600 ring-1 ring-teal-500/30 dark:text-teal-300">
            <Dumbbell className="h-10 w-10" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Cadastro de atleta
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600 dark:text-slate-400">
            Preencha todos os campos com atenção. Após o envio, você será direcionado ao painel com acesso à sua
            área principal, perfil e muito mais.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-zinc-900/80">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
