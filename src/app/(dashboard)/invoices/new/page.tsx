import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function CreateInvoicePage() {
  return (
    <>
      <header className="mb-10 flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary font-headline">Create Invoice</h2>
          <p className="text-on-surface-variant font-medium">Drafting for your next big project</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-primary font-headline">Draft #2026-082</p>
            <p className="text-xs text-on-surface-variant">Unsaved changes</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="User" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhYQ6bM_quYbfE7N5Uuwjamulo8O70eiaaa1HvpJjh_wEQd8KTplrCND36fRP5H-_rI5bZjTZBIf4cBLUKTRILh_5Rrcy1MGtsV7KsNBw03U-GB4zns-8zroN2Gyu490gXBDxoZfxs2FLfqD6MEmHs6lP1glhEfMky3DqsbDrKZHTx61pW5sUi3_zYH06AAHgpUBpsIAwL4LvCWIFjJ3nInduNFMbE5PH_aY25VhEsZquUmwpYmeHFvZx3sLyKQBNjson3zcvi8oc" 
            />
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Forms */}
        <section className="lg:col-span-7 space-y-8">
          {/* AI Natural Language Input */}
          <div className="p-8 rounded-3xl bg-primary text-white relative overflow-hidden group shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary-fixed">Kliq Magic Input</h3>
              </div>
              <label className="block text-2xl font-semibold mb-4 leading-tight font-headline" htmlFor="ai-input">
                Describe your gig naturally...
              </label>
              <div className="relative">
                <textarea 
                  className="w-full bg-white/10 border-0 rounded-2xl p-5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-secondary-fixed transition-all text-lg resize-none font-body" 
                  id="ai-input" 
                  placeholder="e.g. 'I'm charging 50k for a 3-hour photography session for Kola next Tuesday'" 
                  rows={3}
                ></textarea>
                <button className="absolute bottom-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-fixed hover:scale-105 transition-transform active:scale-95 shadow-lg">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                </button>
              </div>
              <p className="mt-4 text-xs text-primary-fixed/60 font-medium">Powered by AI to extract client, amount, and details instantly.</p>
            </div>
            {/* Aesthetic Background Texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-container to-primary rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          </div>
          
          {/* Manual Form */}
          <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-px flex-1 bg-surface-container-highest"></div>
              <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase px-3">or fill manually</span>
              <div className="h-px flex-1 bg-surface-container-highest"></div>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Client Name</label>
                  <input className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" type="text" defaultValue="Kolawole Adedeji" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Email Address</label>
                  <input className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="client@company.com" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Service Description</label>
                <input className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" type="text" defaultValue="3-hour Outdoor Photography Session" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Amount (NGN)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₦</span>
                    <input className="w-full h-14 pl-10 pr-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-bold" type="number" defaultValue="50000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Due Date</label>
                  <input className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" type="date" defaultValue="2026-11-15" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Notes / Terms</label>
                <textarea className="w-full p-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium resize-none" placeholder="Include bank details or specific terms..." rows={3}></textarea>
              </div>
            </form>
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 h-16 rounded-2xl bg-secondary-fixed text-on-secondary-fixed font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-secondary-fixed/20 transition-all active:scale-[0.98]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              Send Invoice
            </button>
            <button className="px-8 h-16 rounded-2xl bg-surface-container-highest text-primary font-bold hover:bg-surface-dim transition-colors">
              Save Draft
            </button>
          </div>
        </section>
        
        {/* Right Column: Live Preview */}
        <section className="lg:col-span-5 sticky top-8">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary/5 overflow-hidden border border-surface-container-highest/50 relative">
            {/* Preview Header Decor */}
            <div className="h-2 bg-gradient-to-r from-primary via-primary-container to-secondary-fixed"></div>
            <div className="p-10 relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h4 className="text-2xl font-black text-primary tracking-tighter font-headline">Kliq</h4>
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">From</p>
                    <p className="text-sm font-bold">Adebayo Samuel</p>
                    <p className="text-xs text-on-surface-variant">Lagos, Nigeria</p>
                  </div>
                </div>
                <div className="text-right">
                  <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Invoice Preview</h5>
                  <div className="bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full inline-block">DRAFT</div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-surface-container py-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Bill To</p>
                    <p className="text-lg font-bold">Kolawole Adedeji</p>
                    <p className="text-sm text-on-surface-variant">kola.a@example.com</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Issue Date</p>
                    <p className="text-sm font-bold">Oct 28, 2026</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-on-surface-variant border-b border-surface-container pb-2">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="max-w-[70%]">
                      <p className="font-bold text-primary font-headline">3-hour Outdoor Photography Session</p>
                      <p className="text-xs text-on-surface-variant mt-1">High-resolution editing included with 20 retouched frames.</p>
                    </div>
                    <p className="font-bold text-primary font-headline">₦ 50,000.00</p>
                  </div>
                </div>
                <div className="pt-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant font-medium">Subtotal</span>
                    <span className="font-bold text-primary font-headline">₦ 50,000.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant font-medium">Tax (0%)</span>
                    <span className="font-bold text-primary font-headline">₦ 0.00</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t-2 border-primary/5">
                    <span className="text-lg font-black text-primary font-headline">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary tracking-tight font-headline">₦ 50,000.00</span>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Due by Nov 15, 2026</p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 p-6 rounded-2xl bg-surface-container-low border-l-4 border-secondary-fixed">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Designer&apos;s Note</p>
                  <p className="text-xs text-on-surface italic leading-relaxed">&quot;Thanks for the opportunity to capture these moments, Kola. Looking forward to our next collaboration!&quot;</p>
                </div>
              </div>
              <div className="mt-12 flex justify-center opacity-10 grayscale pointer-events-none absolute bottom-4 w-full left-0 z-0 overflow-hidden">
                <h4 className="text-[8rem] font-black text-primary tracking-tighter italic select-none">Kliq</h4>
              </div>
            </div>
          </div>
          <p className="text-center mt-6 text-xs text-on-surface-variant font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">visibility</span>
            Real-time preview of your professional invoice
          </p>
        </section>
      </div>
    </>
  );
}
