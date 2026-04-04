"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalClients: 0, activeProjects: 0, avgLTV: 0 });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data = await res.json();
          const clientsData = data.clients || [];
          setClients(clientsData);

          // Calculate Aggregates
          const totalClients = clientsData.length;
          const activeProjects = clientsData.filter((c: any) => c.invoiceCount > 0).length;
          const totalRevenue = clientsData.reduce((acc: number, curr: any) => acc + (curr.totalBilled || 0), 0);
          const avgLTV = totalClients > 0 ? totalRevenue / totalClients : 0;

          setStats({ totalClients, activeProjects, avgLTV });
        }
      } catch (error) {
        console.error("Failed to fetch clients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <>
      {/* Top Bar / Greeting */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">
            Clients
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            Manage your professional network and history.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            New Client
          </button>
        </div>
      </header>

      {/* Stats Overview Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40 border-l-4 border-l-primary-fixed">
          <h3 className="text-sm font-medium text-on-surface-variant mb-1">Total Partners</h3>
          <p className="text-3xl font-black font-headline text-on-surface">{loading ? "-" : stats.totalClients}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
          <h3 className="text-sm font-medium text-on-surface-variant mb-1">Active Projects</h3>
          <p className="text-3xl font-black font-headline text-on-surface">{loading ? "-" : stats.activeProjects}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
          <h3 className="text-sm font-medium text-on-surface-variant mb-1">Avg. Lifetime Value</h3>
          <p className="text-3xl font-black font-headline text-on-surface">
            {loading ? "-" : `₦${stats.avgLTV.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </p>
        </div>
      </section>

      {/* Clients List */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] overflow-hidden">
        <div className="p-6 border-b border-surface-container-low flex justify-between items-center">
          <h2 className="text-xl font-bold font-headline">Client Roster</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="pl-9 pr-4 py-2 bg-surface-container-low rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-4xl mb-4">progress_activity</span>
            <p className="font-medium">Loading your network...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-4 text-surface-variant/50">group_off</span>
            <p className="font-medium">No clients found. Start by creating an invoice!</p>
            <Link href="/invoices/new" className="mt-4 text-primary font-bold hover:underline">
              Create First Invoice
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-surface-container-low">
            {clients.map((client) => (
              <div key={client._id} className="p-6 hover:bg-surface-container-lowest/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Client Profile */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-lg font-headline">
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-on-surface">{client.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant mt-1">
                      <span className="flex items-center gap-1 group">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        <a href={`mailto:${client.email}`} className="group-hover:text-primary transition-colors">{client.email}</a>
                      </span>
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">phone</span>
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client Metrics */}
                <div className="flex items-center gap-12 flex-1 md:justify-end">
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Invoiced</p>
                    <p className="font-bold text-on-surface">₦{(client.totalBilled || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Projects</p>
                    <p className="font-bold text-on-surface">{client.invoiceCount || 0}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Last Active</p>
                    <p className="font-medium text-on-surface-variant">{new Date(client.lastActive).toLocaleDateString()}</p>
                  </div>
                  
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 hover:bg-surface-container-low rounded-lg">
                    more_vert
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
