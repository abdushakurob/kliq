import React from "react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      {/* Top Bar / Greeting */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">
            Overview
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            Welcome back, Creative Architect.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-high p-2 rounded-full cursor-pointer hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">
              notifications
            </span>
          </div>
          <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_12px_rgba(0,52,52,0.04)]">
            <span className="w-2 h-2 bg-secondary-fixed rounded-full"></span>
            <span className="text-sm font-bold text-primary">Live Projects</span>
          </div>
        </div>
      </header>

      {/* Summary Cards Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="col-span-1 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-fixed rounded-xl">
              <span className="material-symbols-outlined text-primary">
                account_balance_wallet
              </span>
            </div>
            <span className="text-xs font-bold text-secondary-fixed-dim bg-secondary-container/10 px-2 py-1 rounded-md">
              +12%
            </span>
          </div>
          <h3 className="text-sm font-medium text-on-surface-variant mb-1">
            Total Earned
          </h3>
          <p className="text-2xl font-black font-headline text-on-surface">₦4.2M</p>
        </div>

        <div className="col-span-1 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary-fixed rounded-xl">
              <span className="material-symbols-outlined text-tertiary">
                pending_actions
              </span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-on-surface-variant mb-1">
            Pending Payments
          </h3>
          <p className="text-2xl font-black font-headline text-on-surface">₦850k</p>
        </div>

        <div className="col-span-1 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-error-container rounded-xl">
              <span className="material-symbols-outlined text-error">
                error_outline
              </span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-on-surface-variant mb-1">
            Overdue Invoices
          </h3>
          <p className="text-2xl font-black font-headline text-on-surface">₦120k</p>
        </div>

        <div className="col-span-1 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-fixed rounded-xl">
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-on-surface-variant mb-1">
            Total Clients
          </h3>
          <p className="text-2xl font-black font-headline text-on-surface">32</p>
        </div>
      </section>

      {/* Middle Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Earnings Chart (Asymmetric larger card) */}
        <section className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold font-headline">Earnings Flow</h2>
              <p className="text-sm text-on-surface-variant">
                Last 30 days performance
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-xs font-bold rounded-lg bg-surface-container-low text-on-surface">
                Monthly
              </button>
              <button className="px-4 py-2 text-xs font-bold rounded-lg text-on-surface-variant">
                Yearly
              </button>
            </div>
          </div>

          {/* Mock Chart using visual elements */}
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            <div className="w-full bg-surface-container-low rounded-t-lg h-24 hover:bg-primary/20 transition-colors"></div>
            <div className="w-full bg-surface-container-low rounded-t-lg h-32 hover:bg-primary/20 transition-colors"></div>
            <div className="w-full bg-primary-container rounded-t-lg h-48 hover:bg-primary transition-colors"></div>
            <div className="w-full bg-surface-container-low rounded-t-lg h-16 hover:bg-primary/20 transition-colors"></div>
            <div className="w-full bg-surface-container-low rounded-t-lg h-40 hover:bg-primary/20 transition-colors"></div>
            <div className="w-full bg-secondary-fixed rounded-t-lg h-56 hover:opacity-80 transition-colors"></div>
            <div className="w-full bg-surface-container-low rounded-t-lg h-20 hover:bg-primary/20 transition-colors"></div>
            <div className="w-full bg-surface-container-low rounded-t-lg h-36 hover:bg-primary/20 transition-colors"></div>
            <div className="w-full bg-primary-container rounded-t-lg h-52 hover:bg-primary transition-colors"></div>
            <div className="w-full bg-surface-container-low rounded-t-lg h-28 hover:bg-primary/20 transition-colors"></div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-2">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </section>

        {/* Recent Activity / Side Card */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-primary p-8 rounded-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold font-headline leading-tight">
                Ready to expand your studio?
              </h2>
              <p className="text-primary-fixed/70 text-sm mt-2 mb-6">
                Connect with top-tier local creatives and scale your architectural projects.
              </p>
              <button className="bg-secondary-fixed text-on-secondary-fixed px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                Explore Talents
              </button>
            </div>
            {/* Abstract geometric background */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute right-4 top-4 w-12 h-12 border border-white/10 rounded-full"></div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold font-headline">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl hover:bg-white transition-colors">
                <span className="text-sm font-medium">Add New Client</span>
                <span className="material-symbols-outlined text-primary text-sm">
                  chevron_right
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl hover:bg-white transition-colors">
                <span className="text-sm font-medium">Download Tax Report</span>
                <span className="material-symbols-outlined text-primary text-sm">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Invoices List */}
      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold font-headline tracking-tight">
            Recent Invoices
          </h2>
          <Link
            href="/invoices"
            className="text-primary font-bold text-sm flex items-center gap-1 hover:underline underline-offset-4 decoration-secondary-fixed decoration-2"
          >
            View all invoices
            <span className="material-symbols-outlined text-xs">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Client Name
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Invoice Date
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {/* Invoice Row */}
                <tr className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-900 font-bold text-xs">
                        OD
                      </div>
                      <span className="font-bold text-on-surface">
                        Oluwadamilare Design
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">
                    Oct 12, 2024
                  </td>
                  <td className="px-8 py-5 font-bold text-on-surface">₦450,000</td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary-container/20 text-on-secondary-container">
                      Paid
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                      more_vert
                    </button>
                  </td>
                </tr>

                {/* Invoice Row */}
                <tr className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-xs">
                        SK
                      </div>
                      <span className="font-bold text-on-surface">
                        Seyi Kwali Arch
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">
                    Oct 28, 2024
                  </td>
                  <td className="px-8 py-5 font-bold text-on-surface">₦1,200,000</td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant">
                      Pending
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                      more_vert
                    </button>
                  </td>
                </tr>

                {/* Invoice Row */}
                <tr className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-xs">
                        BP
                      </div>
                      <span className="font-bold text-on-surface">
                        Bio-Park Group
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">
                    Nov 02, 2024
                  </td>
                  <td className="px-8 py-5 font-bold text-on-surface">₦85,000</td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-error-container text-on-error-container">
                      Overdue
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                      more_vert
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
