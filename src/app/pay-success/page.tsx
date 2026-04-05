"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaySuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";
  const invoiceId = searchParams.get("invoice_id") || "";
  
  // Extract Invoice Number from Reference (e.g. KLIQ_INV-586112_timestamp)
  let invoiceNumber = "N/A";
  if (reference.includes("_")) {
    const parts = reference.split("_");
    if (parts.length > 1) invoiceNumber = parts[1];
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Aesthetic Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-[80px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container/20 rounded-full blur-[80px] -ml-48 -mb-48 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 text-center">
        
        {/* Success Icon */}
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 animate-in zoom-in duration-500">
          <span className="material-symbols-outlined text-white text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>

        <h1 className="text-4xl font-black font-headline tracking-tighter text-primary mb-3">
          Payment Successful!
        </h1>
        <p className="text-on-surface-variant font-medium leading-relaxed mb-10 px-4">
          The payment for invoice <span className="text-primary font-bold">{invoiceNumber}</span> has been secured. You can now download or print your finalized receipt.
        </p>

        {/* Details Card */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-white/60 shadow-lg mb-8 text-left">
           <div className="flex justify-between items-center mb-4 pb-4 border-b border-surface-container-low">
             <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Reference ID</span>
             <code className="text-[10px] font-black text-primary truncate max-w-[180px]">{reference}</code>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</span>
             <div className="flex items-center gap-1.5 text-secondary font-black text-[10px] uppercase">
               <span className="material-symbols-outlined text-[14px]">verified</span>
               Confirmed
             </div>
           </div>
        </div>

        <div className="flex flex-col gap-3">
          {invoiceId && (
            <Link 
              href={`/pay/${invoiceId}`}
              className="w-full h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Review Paid Invoice
            </Link>
          )}
          
          <button 
            onClick={() => window.print()}
            className="w-full h-14 rounded-2xl bg-surface-container-high text-on-surface font-bold flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Receipt
          </button>

          <Link 
            href="/"
            className="text-xs text-on-surface-variant font-bold hover:text-primary transition-colors mt-4"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hidden print-only branding */}
      <div className="hidden print:block fixed top-0 left-0 p-8">
        <h2 className="text-2xl font-black italic">Kliq Invoicing</h2>
        <p className="text-sm">Payment Confirmation Receipt</p>
      </div>
    </div>
  );
}

export default function PaySuccessPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center">
         <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
       </div>
    }>
      <PaySuccessContent />
    </Suspense>
  );
}
