"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaySuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";
  
  // Extract Invoice Number from Reference (e.g. KLIQ_INV-123456_timestamp)
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
        <p className="text-on-surface-variant font-medium leading-relaxed mb-10">
          Your payment for <span className="text-primary font-bold">{invoiceNumber}</span> has been processed successfully. A receipt has been sent to your email.
        </p>

        {/* Details Card */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-white/60 shadow-lg mb-10 text-left">
           <div className="flex justify-between items-center mb-4 pb-4 border-b border-surface-container-low">
             <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Reference ID</span>
             <code className="text-xs font-black text-primary truncate max-w-[150px]">{reference}</code>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</span>
             <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-black uppercase">Verified</span>
           </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            href="/"
            className="w-full h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Return to Dashboard
          </Link>
          <p className="text-xs text-on-surface-variant font-medium opacity-60">
            You can safely close this window now.
          </p>
        </div>
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
