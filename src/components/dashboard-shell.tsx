"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  displayName: string;
  avatarUrl: string | null;
};

export function DashboardShell({ children, displayName, avatarUrl }: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen bg-slate-100 dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/95 shadow-md backdrop-blur-sm transition hover:bg-white dark:border-white/10 dark:bg-zinc-900/95 dark:hover:bg-zinc-900"
        aria-expanded={open}
        aria-controls="dashboard-sidebar-panel"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-5 w-5 text-slate-800 dark:text-slate-100" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        id="dashboard-sidebar-panel"
        className={`fixed inset-y-0 left-0 z-50 w-[min(100vw,280px)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <DashboardSidebar
          onClose={() => setOpen(false)}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
      </div>

      <div className="flex min-h-screen flex-1 flex-col pt-[4.25rem]">
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
