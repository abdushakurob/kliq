"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function EarningsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Revenue Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [projectedRevenue, setProjectedRevenue] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [chartData, setChartData] = useState<{label: string, value: number, heightPercent: number, isCurrent: boolean}[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState(0);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          const invs = data.invoices || [];
          setInvoices(invs);

          // Calculate Metrics
          let collected = 0;
          let projected = 0;
          let overdue = 0;

          invs.forEach((inv: any) => {
            const amt = Number(inv.amount) || 0;
            if (inv.status === "paid") {
              collected += amt;
            } else if (inv.status === "overdue") {
              overdue += amt;
            } else {
              projected += amt;
            }
          });

          setTotalRevenue(collected);
          setProjectedRevenue(projected);
          setOverdueAmount(overdue);

          // Calculate Chart Data (Last 6 Months Earnings)
          const now = new Date();
          const months = Array(6).fill(0);
          const monthLabels = Array(6).fill("");

          // Generate labels (e.g., "Jan", "Feb")
          for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            monthLabels[i] = d.toLocaleString('default', { month: 'short' });
          }

          invs.forEach((inv: any) => {
            if (inv.status !== "paid") return;
            const invDate = new Date(inv.updatedAt || inv.createdAt);
            
            // Difference in months
            const diffMonths = (now.getFullYear() - invDate.getFullYear()) * 12 + (now.getMonth() - invDate.getMonth());
            
            if (diffMonths >= 0 && diffMonths < 6) {
              const monthIndex = 5 - diffMonths; // 5 is current month
              months[monthIndex] += Number(inv.amount) || 0;
            }
          });

          const maxVal = Math.max(...months, 10000); // 10k minimum scale
          const mappedChart = months.map((val, i) => ({
            label: monthLabels[i],
            value: val,
            heightPercent: Math.max((val / maxVal) * 100, 5), // At least 5% so it's visible
            isCurrent: i === 5
          }));
          setChartData(mappedChart);

          // Calculate Month-over-Month Growth
          const currentMonth = months[5];
          const prevMonth = months[4];
          let growth = 0;
          if (prevMonth > 0) {
            growth = ((currentMonth - prevMonth) / prevMonth) * 100;
          } else if (currentMonth > 0) {
            growth = 100;
          }
          setGrowthPercentage(growth);
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">
            Earnings
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            Track your financial performance and revenue flow.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm">
            <span className="material-symbols-outlined text-sm">file_download</span>
            Export CSV
          </button>
        </div>
      </header>

      {/* Top Value Proposition */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-secondary-container text-on-secondary-container p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Total Collected</p>
            <h2 className="text-4xl font-black font-headline mb-4">₦{totalRevenue.toLocaleString()}</h2>
            <div className={`flex items-center gap-2 text-sm font-bold w-fit px-3 py-1 rounded-full ${growthPercentage >= 0 ? "bg-white/20" : "bg-error-container/80 text-error"}`}>
              <span className="material-symbols-outlined text-[16px]">
                {growthPercentage >= 0 ? "trending_up" : "trending_down"}
              </span>
              {growthPercentage > 0 ? "+" : ""}{growthPercentage.toFixed(1)}% this month
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-container-low p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)]">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Projected Pipeline</p>
          <h2 className="text-4xl font-black font-headline text-on-surface mb-2">₦{projectedRevenue.toLocaleString()}</h2>
          <p className="text-on-surface-variant text-sm font-medium">Pending payments and drafts.</p>
        </div>

        <div className="bg-error-container border border-error-container/50 p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] text-on-error-container">
          <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Currently Overdue</p>
          <h2 className="text-4xl font-black font-headline mb-2">₦{overdueAmount.toLocaleString()}</h2>
          <p className="text-sm font-medium opacity-80">Requires immediate follow-up.</p>
        </div>
      </section>

      {/* Analytics Chart Mock */}
      <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40 mb-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xl font-bold font-headline text-on-surface">Revenue History</h2>
            <p className="text-sm text-on-surface-variant">Your income over the last 6 months</p>
          </div>
          <select className="bg-surface-container-low border-none rounded-lg px-4 py-2 font-bold text-on-surface focus:ring-0">
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
        </div>

        <div className="relative h-72 flex items-end justify-between gap-4 px-4 pb-8 border-b border-surface-container-low">
          {/* Y Axis Lines */}
          <div className="absolute inset-x-0 bottom-8 top-0 flex flex-col justify-between pointer-events-none">
            <div className="w-full border-b border-surface-container-highest/20"></div>
            <div className="w-full border-b border-surface-container-highest/20"></div>
            <div className="w-full border-b border-surface-container-highest/20"></div>
            <div className="w-full border-b border-surface-container-highest/20"></div>
          </div>

          {/* Dynamic Bars */}
          {chartData.map((data, i) => (
            <div key={i} className="relative z-10 w-full max-w-[64px] group flex flex-col items-center h-full justify-end">
              <div 
                className="w-full rounded-t-lg transition-all duration-500 ease-in-out cursor-pointer hover:opacity-80"
                style={{ 
                  height: `${data.heightPercent}%`,
                  backgroundColor: data.isCurrent ? 'var(--color-primary)' : 'var(--color-surface-container-highest)'
                }}
              ></div>
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-surface text-xs font-bold py-1 px-2 rounded whitespace-nowrap pointer-events-none">
                ₦{data.value.toLocaleString()}
              </div>
              <span className={`absolute -bottom-8 font-bold text-xs uppercase ${data.isCurrent ? "text-primary" : "text-on-surface-variant"}`}>
                {data.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent High Value Transactions */}
      <section className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] overflow-hidden">
         <div className="p-6 border-b border-surface-container-low">
          <h2 className="text-xl font-bold font-headline">Recent Collected Transactions</h2>
        </div>
        <div className="divide-y divide-surface-container-low">
          {loading ? (
             <div className="p-10 text-center text-on-surface-variant">Loading ledgers...</div>
          ) : invoices.filter(i => i.status === 'paid').length === 0 ? (
             <div className="p-10 text-center text-on-surface-variant">No paid transactions recorded yet.</div>
          ) : (
            invoices.filter(i => i.status === 'paid').sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5).map(inv => (
               <div key={inv._id} className="p-6 flex items-center justify-between hover:bg-surface-container-lowest/50 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary-fixed-dim">
                     <span className="material-symbols-outlined">paid</span>
                   </div>
                   <div>
                     <p className="font-bold text-on-surface">{inv.clientId?.name || "Unknown Client"}</p>
                     <p className="text-sm text-on-surface-variant">{inv.serviceDetails || "Architecture Service"}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-lg text-on-surface">₦{Number(inv.amount).toLocaleString()}</p>
                   <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Paid on {new Date(inv.updatedAt).toLocaleDateString()}</p>
                 </div>
               </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
