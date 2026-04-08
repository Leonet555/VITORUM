"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Trophy,
  UsersRound,
  LogOut,
  Dumbbell,
} from "lucide-react";
import { logout } from "@/app/actions";

const nav = [
  { href: "/dashboard/principal", label: "Tela principal", icon: LayoutDashboard },
  { href: "/dashboard/perfil", label: "Perfil", icon: UserCircle },
  { href: "/dashboard/campeonatos", label: "Campeonatos", icon: Trophy },
  { href: "/dashboard/equipes", label: "Equipes", icon: UsersRound },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 shadow-xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30">
          <Dumbbell className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Vitorum</p>
          <p className="font-semibold text-white">Área do atleta</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Principal">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard/principal"
              ? pathname === "/dashboard/principal" || pathname.startsWith("/dashboard/criar")
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-500/15 text-teal-100 ring-1 ring-teal-400/40"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sair
          </button>
        </form>
        <p className="mt-3 px-1 text-center text-[11px] text-slate-500">Você voltará à tela de cadastro</p>
      </div>
    </aside>
  );
}
