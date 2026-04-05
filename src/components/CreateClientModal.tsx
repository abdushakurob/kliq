"use client";

import React, { useState } from "react";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateClientModal({ isOpen, onClose, onSuccess }: CreateClientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create client");
      }

      setFormData({ name: "", email: "", phone: "", company: "" });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black font-headline tracking-tight">New Partner</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-error-container text-on-error-container text-xs font-bold rounded-xl animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name *</label>
              <input 
                required
                type="text" 
                placeholder="E.g. Kolawole Adedeji"
                className="w-full h-12 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-0 focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address *</label>
              <input 
                required
                type="email" 
                placeholder="client@company.com"
                className="w-full h-12 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-0 focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Phone (Optional)</label>
                <input 
                  type="tel" 
                  placeholder="+234..."
                  className="w-full h-12 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-0 focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Company</label>
                <input 
                  type="text" 
                  placeholder="Studio Corp"
                  className="w-full h-12 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-0 focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-12 rounded-xl font-bold text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Client"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
