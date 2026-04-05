"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function InvoicesListPage() {
  const searchParams = useSearchParams();
  const clientFilter = searchParams.get("client");
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          let list = data.invoices || [];
          if (clientFilter) {
            list = list.filter((inv: any) => inv.clientId?._id === clientFilter);
          }
          setInvoices(list);
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [clientFilter]);

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvoices(invoices.filter(inv => inv._id !== id));
        setOpenMenuId(null);
      }
    } catch (e) {}
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Payment link copied to clipboard!");
    setOpenMenuId(null);
  };

  const getStatusBadgeList = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-black uppercase tracking-tighter">Paid</span>;
      case "sent":
      case "pending":
        return <span className="px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-black uppercase tracking-tighter">Pending</span>;
      case "overdue":
        return <span className="px-4 py-1.5 bg-error-container text-on-error-container rounded-full text-xs font-black uppercase tracking-tighter">Overdue</span>;
      default:
        return <span className="px-4 py-1.5 bg-surface-container-highest text-on-surface rounded-full text-xs font-black uppercase tracking-tighter">Draft</span>;
    }
  };

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
        {["All", "Paid", "Pending", "Overdue"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${filter === tab ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}`}
          >
            {tab}
          </button>
        ))}
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
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-20 text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined animate-spin text-[30px] mb-2">progress_activity</span>
                  <p>Loading invoices...</p>
                </td>
              </tr>
            ) : invoices.filter(inv => {
                if (filter === "All") return true;
                if (filter === "Pending") return inv.status === "sent" || inv.status === "pending";
                return inv.status === filter.toLowerCase();
            }).length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-20 text-on-surface-variant font-medium">
                  <p>No invoices found. <Link href="/invoices/new" className="text-primary hover:underline">Create your first invoice</Link></p>
                </td>
              </tr>
            ) : (
              invoices.filter(inv => {
                if (filter === "All") return true;
                if (filter === "Pending") return inv.status === "sent" || inv.status === "pending";
                return inv.status === filter.toLowerCase();
              }).map((inv) => (
                <tr key={inv._id} className="group hover:bg-surface-container-low/30 transition-colors relative">
                  <td className="px-8 py-6">
                    <span className="font-headline font-bold text-primary">{inv.invoiceNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 flex items-center justify-center font-bold text-primary-container text-xs overflow-hidden">
                        {(inv.clientId?.name || "C").charAt(0)}
                      </div>
                      <span className="font-bold text-on-surface">{inv.clientId?.name || "Unknown Client"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-on-surface-variant font-medium">{inv.serviceDescription}</td>
                  <td className="px-8 py-6 text-right font-bold text-primary">₦{Number(inv.amount).toLocaleString()}</td>
                  <td className="px-8 py-6 text-on-surface-variant font-medium text-sm">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    {getStatusBadgeList(inv.status)}
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === inv._id ? null : inv._id)}
                      className="opacity-100 p-2 text-outline hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    
                    {/* Minimal Dropdown Menu */}
                    {openMenuId === inv._id && (
                      <div className="absolute right-8 top-12 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-outline-variant/20 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {inv.status !== 'draft' && (
                          <button 
                            onClick={() => handleCopyLink(`${window.location.origin}/pay/${inv._id}`)}
                            className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-surface-container-low transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">share</span>
                            Copy Link
                          </button>
                        )}
                        <Link 
                          href={`/invoices/${inv._id}`}
                          className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-surface-container-low transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                          View
                        </Link>
                        <button 
                          onClick={() => handleDeleteInvoice(inv._id)}
                          className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-error/10 text-error transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Section */}
        {!loading && invoices.length > 0 && (
          <div className="px-8 py-8 flex flex-col md:flex-row items-center justify-between border-t border-outline-variant/5 gap-4" onClick={() => setOpenMenuId(null)}>
            <span className="text-on-surface-variant text-sm font-medium">Showing <span className="text-primary font-bold">1-{invoices.length}</span> of {invoices.length} invoices</span>
            <div className="flex items-center space-x-2">
              <button disabled className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low text-outline disabled:opacity-30">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary font-bold shadow-md">1</button>
              <button disabled className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low text-outline disabled:opacity-30">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
