import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function InvoicesListPage() {
  return (
    <>
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary mb-3 font-headline">Invoices</h2>
          <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
            Manage your creative billing and track payment flows across all active projects.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="pl-12 pr-6 py-4 w-80 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              placeholder="Search by client or invoice ID..."
              type="text"
            />
          </div>
          <button className="p-4 bg-surface-container-lowest text-primary rounded-xl hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 mb-8 overflow-x-auto pb-2">
        <button className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm transition-all">All</button>
        <button className="px-6 py-2.5 hover:bg-surface-container text-on-surface-variant rounded-full font-bold text-sm transition-all">Paid</button>
        <button className="px-6 py-2.5 hover:bg-surface-container text-on-surface-variant rounded-full font-bold text-sm transition-all">Pending</button>
        <button className="px-6 py-2.5 hover:bg-surface-container text-on-surface-variant rounded-full font-bold text-sm transition-all">Overdue</button>
        <div className="flex-grow"></div>
        <div className="flex items-center space-x-2 text-on-surface-variant text-sm font-bold bg-surface-container px-4 py-2.5 rounded-full">
          <span className="material-symbols-outlined text-sm">sort</span>
          <span>Sort: Newest First</span>
        </div>
      </div>

      {/* Invoices Bento/Table Hybrid */}
      <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,52,52,0.04)] border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-on-surface-variant">Invoice #</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-on-surface-variant">Client</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-on-surface-variant">Service</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-on-surface-variant text-right">Amount</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-on-surface-variant">Date</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-on-surface-variant">Status</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {/* Row 1 */}
            <tr className="group hover:bg-surface-container-low/30 transition-colors">
              <td className="px-8 py-6">
                <span className="font-headline font-bold text-primary">KLQ-2026-081</span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Client Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuXtJ-RFXNUmuKtpmUeqmyW3_KFcaXqkirh_plVq2WHj8lis-YRzp9zH07njalAXF8Gsg3KPiujs2y47UIHgGBSqlBXeILdnj11YtH8T3VE8KtkxtjdIYkoOptTBNDIWVXMx1C7u36fEZC6bknXIXiP6MQ95L40ecAxXZ9POPuvUSmR6Bu57IRaakwMTKjuVbft1w8bN87TuuCBDyKbrDNY9k2g608B7HTonbtgRcuihG2kLkfKRg6P05zxlMTJndZkI5UBT3LJ-8" />
                  </div>
                  <span className="font-bold text-on-surface">Ayo Olumide</span>
                </div>
              </td>
              <td className="px-8 py-6 text-on-surface-variant font-medium">Brand Identity Design</td>
              <td className="px-8 py-6 text-right font-bold text-primary">₦1,250,000</td>
              <td className="px-8 py-6 text-on-surface-variant font-medium text-sm">Oct 24, 2026</td>
              <td className="px-8 py-6">
                <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-black uppercase tracking-tighter">Paid</span>
              </td>
              <td className="px-8 py-6 text-right">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-outline hover:text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="group hover:bg-surface-container-low/30 transition-colors">
              <td className="px-8 py-6">
                <span className="font-headline font-bold text-primary">KLQ-2026-082</span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Client Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvWvCS3BNaknT_aj-gO6HAPAnYOPkKGA-hHF8fmLCK0d6P8O7ZD-lDJEsnOwzA0h-54NoomCdNvGiicAWC5nEPqPquF7IONGys3RxTg683IBb2UQXtXWvUjG0uxt4qBwqev0xyBwE1AFsavNpX52hRvtoX8sYOKD931jwFQnzFk_0cwssbDYpwvjaBdUftUoOX7SLs8HsWOQslkzUrahKApp6CPhI5GwWsXpSq6AR0fqLOCVPNyKoMzpRXx3McTSOzwh1kXLdrtec" />
                  </div>
                  <span className="font-bold text-on-surface">Zainab Saliu</span>
                </div>
              </td>
              <td className="px-8 py-6 text-on-surface-variant font-medium">UI Architecture</td>
              <td className="px-8 py-6 text-right font-bold text-primary">₦850,000</td>
              <td className="px-8 py-6 text-on-surface-variant font-medium text-sm">Oct 26, 2026</td>
              <td className="px-8 py-6">
                <span className="px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-black uppercase tracking-tighter">Pending</span>
              </td>
              <td className="px-8 py-6 text-right">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-outline hover:text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="group hover:bg-surface-container-low/30 transition-colors">
              <td className="px-8 py-6">
                <span className="font-headline font-bold text-primary">KLQ-2026-079</span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Client Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBULn-la7GpjWFEp0bmPOPC8ZJK-nu_xCUIlT0CfpcyH096h2qkjXAP50Vpcr5kZp2rWK_Z0rqtaPiXQrYC3_V9sxcePxxA3P2HFVDXDzpnu6wVsCgiDKfGDAIb9zktzTgZ4RloESePwN8HpaQ2POgwO-Hpj6pO_2gqoYBHlU5UgSCUlOq5kqIxoh9oii1OoD27gHTsXa2zGg4HO7KV97Yb5V6RRTKV0o2mJb-Xymk8lyI_ErwPhkO6KimTqF0Mru_ALbssQF2xVVQ" />
                  </div>
                  <span className="font-bold text-on-surface">Emeka Okafor</span>
                </div>
              </td>
              <td className="px-8 py-6 text-on-surface-variant font-medium">Motion Graphics</td>
              <td className="px-8 py-6 text-right font-bold text-primary">₦420,000</td>
              <td className="px-8 py-6 text-on-surface-variant font-medium text-sm">Oct 12, 2026</td>
              <td className="px-8 py-6">
                <span className="px-4 py-1.5 bg-error-container text-on-error-container rounded-full text-xs font-black uppercase tracking-tighter">Overdue</span>
              </td>
              <td className="px-8 py-6 text-right">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-outline hover:text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
            {/* Row 4 */}
            <tr className="group hover:bg-surface-container-low/30 transition-colors">
              <td className="px-8 py-6">
                <span className="font-headline font-bold text-primary">KLQ-2026-078</span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Client Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVprrZ4bc1YMGdzZDHXesjaEakCiz741Gmn_n_ONFMGxbyiGVMCuGz38zg8zh7T8gJhyTCe7hTFC6LKAmpv8A6UeeiM8yglYW60K6fPppfTyiXcylWKXYDzDGc6BHZehMSwXtrefpaobCiPJDTROh4XwLjo_z8QJr_o9Y45ihyojsLvu9A7ks6KzYJZLbf8nf3k0VNNbwQWh5hrjsBOr4C4nirn060pradKDI7Oo2HszXcDbmcAOLSUBdg-s9bOP7ep5Yjtg3K1Wc" />
                  </div>
                  <span className="font-bold text-on-surface">Chidi Enwere</span>
                </div>
              </td>
              <td className="px-8 py-6 text-on-surface-variant font-medium">Product Photography</td>
              <td className="px-8 py-6 text-right font-bold text-primary">₦2,100,000</td>
              <td className="px-8 py-6 text-on-surface-variant font-medium text-sm">Oct 10, 2026</td>
              <td className="px-8 py-6">
                <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-black uppercase tracking-tighter">Paid</span>
              </td>
              <td className="px-8 py-6 text-right">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-outline hover:text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
            {/* Row 5 */}
            <tr className="group hover:bg-surface-container-low/30 transition-colors">
              <td className="px-8 py-6">
                <span className="font-headline font-bold text-primary">KLQ-2026-075</span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 flex items-center justify-center font-bold text-primary-container text-xs">
                    BK
                  </div>
                  <span className="font-bold text-on-surface">Bayo Kuku</span>
                </div>
              </td>
              <td className="px-8 py-6 text-on-surface-variant font-medium">Editorial Consultation</td>
              <td className="px-8 py-6 text-right font-bold text-primary">₦150,000</td>
              <td className="px-8 py-6 text-on-surface-variant font-medium text-sm">Oct 05, 2026</td>
              <td className="px-8 py-6">
                <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-black uppercase tracking-tighter">Paid</span>
              </td>
              <td className="px-8 py-6 text-right">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-outline hover:text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Pagination Section */}
        <div className="px-8 py-8 flex flex-col md:flex-row items-center justify-between border-t border-outline-variant/5 gap-4">
          <span className="text-on-surface-variant text-sm font-medium">Showing <span className="text-primary font-bold">1-10</span> of 142 invoices</span>
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low text-outline disabled:opacity-30">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary font-bold shadow-md">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low text-on-surface font-bold">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low text-on-surface font-bold">3</button>
            <span className="px-2 text-outline">...</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low text-on-surface font-bold">15</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low text-outline">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
