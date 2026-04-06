"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Wordmark from "@/components/Wordmark";

export default function Sidebar() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-[0_12px_40px_rgba(0,52,52,0.06)] flex flex-col p-4 space-y-2 z-50">
      {/* Sidebar Header */}
      <div className="px-4 py-8 mb-6 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex flex-col">
          <Link href="/dashboard" className="block">
            <Wordmark size="md" />
          </Link>
          {/* <span className="text-[10px] text-primary font-black tracking-[0.2em] uppercase mt-2 ml-1">Premium</span> */}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 space-y-1">
        <Link
          href="/dashboard"
          className={`px-4 py-3 font-bold flex items-center gap-3 transition-transform duration-200 hover:translate-x-1 active:scale-95 rounded-xl ${isLinkActive("/dashboard")
              ? "bg-teal-900 dark:bg-lime-400 text-white dark:text-zinc-950"
              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
            }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link
          href="/invoices"
          className={`px-4 py-3 font-bold flex items-center gap-3 transition-transform duration-200 hover:translate-x-1 active:scale-95 rounded-xl ${isLinkActive("/invoices")
              ? "bg-teal-900 dark:bg-lime-400 text-white dark:text-zinc-950 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
            }`}
        >
          <span className="material-symbols-outlined">description</span>
          <span className="font-medium">Invoices</span>
        </Link>
        <Link
          href="/clients"
          className={`px-4 py-3 font-bold flex items-center gap-3 transition-transform duration-200 hover:translate-x-1 active:scale-95 rounded-xl ${isLinkActive("/clients")
              ? "bg-teal-900 dark:bg-lime-400 text-white dark:text-zinc-950 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
            }`}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="font-medium">Clients</span>
        </Link>
        <Link
          href="/earnings"
          className={`px-4 py-3 font-bold flex items-center gap-3 transition-transform duration-200 hover:translate-x-1 active:scale-95 rounded-xl ${isLinkActive("/earnings")
              ? "bg-teal-900 dark:bg-lime-400 text-white dark:text-zinc-950 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
            }`}
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="font-medium">Earnings</span>
        </Link>
        <Link
          href="/settings"
          className={`px-4 py-3 font-bold flex items-center gap-3 transition-transform duration-200 hover:translate-x-1 active:scale-95 rounded-xl ${isLinkActive("/settings")
              ? "bg-teal-900 dark:bg-lime-400 text-white dark:text-zinc-950 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
            }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-medium">Settings</span>
        </Link>
      </nav>

      {/* CTA in Sidebar */}
      <div className="px-2 pt-4">
        <Link
          href="/invoices/new"
          className="w-full py-4 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(129,255,31,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Create Invoice
        </Link>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-4 border-t border-zinc-200/10">
        <Link
          href="/api/auth/signout"
          className="text-zinc-500 dark:text-zinc-400 px-4 py-3 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-3 transition-transform duration-200 hover:translate-x-1 active:scale-95"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </aside>
  );
}
