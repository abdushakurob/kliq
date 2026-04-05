"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function EarningsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMessage, setWithdrawMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Revenue Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [projectedRevenue, setProjectedRevenue] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [chartData, setChartData] = useState<{label: string, value: number, heightPercent: number, isCurrent: boolean}[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, wdlRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/withdrawals")
      ]);

      let invs = [];
      let wdls = [];

      if (invRes.ok) {
        const data = await invRes.json();
        invs = data.invoices || [];
        setInvoices(invs);
      }

      if (wdlRes.ok) {
        const data = await wdlRes.json();
        wdls = data.withdrawals || [];
        setWithdrawals(wdls);
      }

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

      const totalWithdrawn = wdls
        .filter((w: any) => w.status === "success" || w.status === "pending")
        .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

      setTotalRevenue(collected);
      setAvailableBalance(collected - totalWithdrawn);
      setProjectedRevenue(projected);
      setOverdueAmount(overdue);

      // Calculate Chart Data (Last 6 Months Earnings)
      const now = new Date();
      const months = Array(6).fill(0);
      const monthLabels = Array(6).fill("");

      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        monthLabels[i] = d.toLocaleString('default', { month: 'short' });
      }

      invs.forEach((inv: any) => {
        if (inv.status !== "paid") return;
        const invDate = new Date(inv.updatedAt || inv.createdAt);
        const diffMonths = (now.getFullYear() - invDate.getFullYear()) * 12 + (now.getMonth() - invDate.getMonth());
        if (diffMonths >= 0 && diffMonths < 6) {
          const monthIndex = 5 - diffMonths;
          months[monthIndex] += Number(inv.amount) || 0;
        }
      });

      const maxVal = Math.max(...months, 10000);
      const mappedChart = months.map((val, i) => ({
        label: monthLabels[i],
        value: val,
        heightPercent: Math.max((val / maxVal) * 100, 5),
        isCurrent: i === 5
      }));
      setChartData(mappedChart);

      const currentMonth = months[5];
      const prevMonth = months[4];
      let growth = 0;
      if (prevMonth > 0) {
        growth = ((currentMonth - prevMonth) / prevMonth) * 100;
      } else if (currentMonth > 0) {
        growth = 100;
      }
      setGrowthPercentage(growth);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawing(true);
    setWithdrawMessage(null);

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawMessage({ type: 'error', text: 'Please enter a valid amount.' });
      setWithdrawing(false);
      return;
    }

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt })
      });
      const data = await res.json();

      if (res.ok) {
        setWithdrawMessage({ type: 'success', text: 'Payout initiated successfully!' });
        setWithdrawAmount("");
        setTimeout(() => {
          setShowWithdrawModal(false);
          setWithdrawMessage(null);
          fetchData();
        }, 2000);
      } else {
        setWithdrawMessage({ type: 'error', text: data.error || 'Withdrawal failed.' });
      }
    } catch (err) {
      setWithdrawMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setWithdrawing(false);
    }
  };

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
        <div className="flex gap-3">
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="bg-primary hover:bg-primary/90 transition-all text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            Withdraw Funds
          </button>
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

        <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)]">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Available to Withdraw</p>
          <h2 className="text-4xl font-black font-headline text-on-surface mb-2">₦{availableBalance.toLocaleString()}</h2>
          <p className="text-on-surface-variant text-sm font-medium">Ready for payout to bank.</p>
        </div>

        <div className="bg-surface-container-lowest border border-surface-container-low p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)]">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Projected Pipeline</p>
          <h2 className="text-4xl font-black font-headline text-on-surface mb-2">₦{projectedRevenue.toLocaleString()}</h2>
          <p className="text-on-surface-variant text-sm font-medium">Pending payments and overdue (₦{overdueAmount.toLocaleString()}).</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <section className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] overflow-hidden h-fit">
          <div className="p-6 border-b border-surface-container-low">
            <h2 className="text-xl font-bold font-headline text-on-surface">Collected Revenue</h2>
          </div>
          <div className="divide-y divide-surface-container-low">
            {loading ? (
              <div className="p-10 text-center text-on-surface-variant text-sm font-medium">Loading ledger...</div>
            ) : invoices.filter(i => i.status === 'paid').length === 0 ? (
              <div className="p-10 text-center text-on-surface-variant text-sm font-medium">No paid transactions recorded yet.</div>
            ) : (
              invoices.filter(i => i.status === 'paid').sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10).map(inv => (
                <div key={inv._id} className="p-6 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary-fixed-dim">
                      <span className="material-symbols-outlined">paid</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{inv.clientId?.name || "Unknown Client"}</p>
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{inv.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-on-surface">₦{Number(inv.amount).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mt-1 opacity-70">
                      {new Date(inv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Withdrawal History */}
        <section className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] overflow-hidden h-fit">
          <div className="p-6 border-b border-surface-container-low">
            <h2 className="text-xl font-bold font-headline text-on-surface">Payout History</h2>
          </div>
          <div className="divide-y divide-surface-container-low">
            {loading ? (
              <div className="p-10 text-center text-on-surface-variant text-sm font-medium">Loading history...</div>
            ) : withdrawals.length === 0 ? (
              <div className="p-10 text-center text-on-surface-variant text-sm font-medium">No withdrawals found.</div>
            ) : (
              withdrawals.map(wdl => (
                <div key={wdl._id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      wdl.status === 'success' ? 'bg-primary/10 text-primary' : 
                      wdl.status === 'pending' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                    }`}>
                      <span className="material-symbols-outlined">
                        {wdl.status === 'success' ? 'check_circle' : wdl.status === 'pending' ? 'schedule' : 'error'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">₦{wdl.amount.toLocaleString()}</p>
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                        {wdl.accountNumber} • {wdl.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      {new Date(wdl.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black font-headline tracking-tight text-on-surface">Withdraw Funds</h2>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>

            <div className="p-5 bg-primary/5 rounded-2xl mb-8 border border-primary/10 text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Available for Payout</p>
              <h3 className="text-3xl font-black font-headline text-on-surface">₦{availableBalance.toLocaleString()}</h3>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-xl font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="0.00"
                  max={availableBalance}
                  autoFocus
                />
              </div>

              {withdrawMessage && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${
                  withdrawMessage.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {withdrawMessage.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  {withdrawMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > availableBalance}
                className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-full font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
              >
                {withdrawing ? (
                  <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Process Withdrawal
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-center text-on-surface-variant font-medium leading-relaxed mt-4">
                Funds will be sent to your primary bank account set in Settings. Small transaction fees from Squadco may apply.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
