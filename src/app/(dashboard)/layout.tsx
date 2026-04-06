import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Wordmark from "@/components/Wordmark";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen font-body">
      {/* SideNavBar Component */}
      <Sidebar />

      {/* Main Canvas + Children */}
      <main className="ml-72 mr-8 pt-8 pb-20">
        {children}
      </main>

      {/* Floating Action Button */}
      <Link href="/chat" className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_12px_40px_rgba(0,52,52,0.25)] hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add_notes</span>
      </Link>

      {/* Footer Component */}
      <footer className="ml-72 mr-8 border-t border-zinc-200/10 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <div className="flex flex-col mb-4 md:mb-0">
            <Link href="/dashboard" className="block mb-2">
              <Wordmark size="sm" className="grayscale opacity-50 contrast-125" />
            </Link>
            <p className="text-zinc-500 text-[10px] font-medium ml-1">
              © 2026. Built for the Modern Creative Economy.
            </p>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="text-zinc-500 text-sm hover:text-teal-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-zinc-500 text-sm hover:text-teal-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-zinc-500 text-sm hover:text-teal-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
