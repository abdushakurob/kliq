import React from "react";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import User from "@/models/User";

// Force Next.js to dynamically render this page (never cache public invoice links)
export const dynamic = 'force-dynamic';

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  // Find Invoice and populate referenced objects
  // Initialize models so mongoose knows them
  Client.init();
  User.init();
  
  const invoice = await Invoice.findById(id)
    .populate("clientId", "name email phone")
    .populate("userId", "name email phone")
    .lean();

  if (!invoice) return notFound();

  const serialized = JSON.parse(JSON.stringify(invoice));
  
  // Basic info fallbacks
  const studioName = serialized.userId?.name || "Kliq Studio";
  const clientName = serialized.clientId?.name || "Valued Client";
  const isPaid = serialized.status === "paid";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 md:p-12 selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Aesthetic Background Orbs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-primary-container/30 to-secondary-container/30 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-secondary-fixed-dim/20 to-primary/5 rounded-full blur-[100px] -ml-64 -mb-64 pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header branding */}
        <div className="mb-8 flex justify-between items-center px-4">
          <h1 className="text-3xl font-black text-primary tracking-tighter font-headline italic">Kliq</h1>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Secure Invoice</p>
             <p className="text-sm font-bold text-on-surface">Payment Portal</p>
          </div>
        </div>

        {/* Payload Card */}
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-[0_24px_80px_rgba(0,52,52,0.08)] border border-white/60 overflow-hidden relative">
           
           {/* Top decorative bar */}
           <div className={`h-2 w-full ${isPaid ? 'bg-secondary-fixed' : 'bg-gradient-to-r from-primary to-primary-container'}`}></div>

           <div className="p-10 sm:p-14">
             {/* Status Badge */}
             {isPaid && (
               <div className="mb-8 flex items-center gap-2 bg-secondary-container/40 text-secondary-fixed font-bold px-4 py-2 rounded-full w-fit mx-auto border border-secondary-fixed/20">
                 <span className="material-symbols-outlined shrink-0 text-[18px]">verified</span>
                 <span className="text-sm">Payment Completed</span>
               </div>
             )}

             {/* Identities */}
             <div className="grid grid-cols-2 gap-8 mb-12">
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">From</h3>
                  <p className="font-bold text-lg text-on-surface font-headline">{studioName}</p>
                  <p className="text-sm text-on-surface-variant">{serialized.userId?.email}</p>
               </div>
               <div className="text-right">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Billed To</h3>
                  <p className="font-bold text-lg text-on-surface font-headline">{clientName}</p>
                  <p className="text-sm text-on-surface-variant">{serialized.clientId?.email}</p>
               </div>
             </div>

             {/* Ledger */}
             <div className="border border-surface-container-highest/30 rounded-2xl p-6 bg-surface-container-low/30 mb-8">
                <div className="flex justify-between items-center border-b border-surface-container-highest/20 pb-4 mb-4">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Amount</span>
                </div>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold font-headline text-on-surface max-w-[70%]">{serialized.serviceDetails}</h2>
                  <p className="text-xl font-bold font-headline text-on-surface">₦ {Number(serialized.amount).toLocaleString()}</p>
                </div>
                {serialized.notesTerms && (
                  <p className="text-sm text-on-surface-variant mt-4 italic">Note: {serialized.notesTerms}</p>
                )}
             </div>

             {/* Total & Action */}
             <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mt-12 bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Due</p>
                  <p className={`text-4xl font-black font-headline tracking-tighter ${isPaid ? 'text-on-surface-variant/50 line-through' : 'text-primary'}`}>
                    ₦ {Number(serialized.amount).toLocaleString()}
                  </p>
                </div>

                {!isPaid ? (
                  <form action={`/api/payments/checkout`} method="POST" className="w-full sm:w-auto">
                    <input type="hidden" name="invoiceId" value={serialized._id} />
                    <button 
                      type="submit"
                      className="w-full sm:w-auto px-10 h-16 rounded-2xl bg-primary text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                      Pay Securely
                    </button>
                    <p className="text-center sm:text-right text-[10px] text-on-surface-variant mt-2 font-medium flex items-center justify-center sm:justify-end gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified_user</span>
                      Protected by Squad
                    </p>
                  </form>
                ) : (
                  <button disabled className="w-full sm:w-auto px-10 h-16 rounded-2xl bg-surface-container-highest text-on-surface-variant font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed">
                     Paid in Full
                  </button>
                )}
             </div>

           </div>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-8 font-medium">
          Powered by <span className="font-bold">Kliq Invoicing</span> &copy; {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
}
