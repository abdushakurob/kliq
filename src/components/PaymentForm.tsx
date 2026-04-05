"use client";

import React, { useState } from "react";

interface PaymentFormProps {
  invoiceId: string;
}

export default function PaymentForm({ invoiceId }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // The form will submit naturally to /api/payments/checkout
  };

  return (
    <form 
      action="/api/payments/checkout" 
      method="POST" 
      className="w-full sm:w-auto"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <button 
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-10 h-16 rounded-2xl bg-primary text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Initializing...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            Pay Securely
          </>
        )}
      </button>
      <p className="text-center sm:text-right text-[10px] text-on-surface-variant mt-2 font-medium flex items-center justify-center sm:justify-end gap-1">
        <span className="material-symbols-outlined text-[12px]">verified_user</span>
        Protected by Squad
      </p>
    </form>
  );
}
