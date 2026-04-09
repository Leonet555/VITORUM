"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Trophy,
  UsersRound,
  LogOut,
  X,
  User,
} from "lucide-react";
import { logout } from "@/app/actions";

const nav = [
  { href: "/dashboard/principal", label: "Tela principal", icon: LayoutDashboard },
  { href: "/dashboard/perfil", label: "Perfil", icon: UserCircle },
  { href: "/dashboard/campeonatos", label: "Campeonatos", icon: Trophy },
  { href: "/dashboard/equipes", label: "Equipes", icon: UsersRound },
] as const;

type DashboardSidebarProps = {
  onClose?: () => void;
  displayName: string;
  avatarUrl: string | null;
};

export function DashboardSidebar({ onClose, displayName, avatarUrl }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-full max-w-[280px] flex-col border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 shadow-xl">
      <div className="relative border-b border-white/10 px-4 pb-5 pt-4 sm:px-6">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
        <div className="flex flex-col items-center px-2 pt-2">
          <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 ring-2 ring-teal-500/35">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-9 w-9 text-slate-500" aria-hidden />
            )}
          </div>
          <p className="mt-3 max-w-[220px] text-center text-sm font-semibold leading-snug text-white">{displayName}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-500">Vitorum</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Principal">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard/principal"
              ? pathname === "/dashboard/principal" ||
                pathname.startsWith("/dashboard/personalizar") ||
                pathname.startsWith("/dashboard/ver-tudo") ||
                pathname.startsWith("/dashboard/criar")
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onClose?.()}
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
