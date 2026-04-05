import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import InvoiceActionsClient from "@/components/InvoiceActionsClient";
import InvoicePaperQRCode from "@/components/InvoicePaperQRCode";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  await dbConnect();
  Client.init(); // Prevent mongoose population crash
  const { id } = await params;

  // Find Invoice
  const invoice = await Invoice.findOne({
    _id: id,
    userId: (session.user as any).id
  }).populate("clientId").lean();

  if (!invoice) return notFound();

  // Convert to serializable format
  const serialized = JSON.parse(JSON.stringify(invoice));
  const link = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pay/${serialized._id}`;

  return (
    <>
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline flex items-center gap-3">
              Invoice Details
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${serialized.status === 'paid' ? 'bg-secondary-container/30 text-secondary-fixed' :
                serialized.status === 'overdue' ? 'bg-error-container text-on-error-container' :
                  'bg-surface-container-highest text-on-surface'
                }`}>
                {serialized.status}
              </span>
            </h1>
            <p className="text-sm font-medium text-on-surface-variant mt-1">ID: {serialized._id}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Invoice Paper View */}
        <section className="lg:col-span-8">
          <div id="invoice-paper" className="bg-white rounded-[2rem] shadow-[0_12px_40px_rgba(0,52,52,0.04)] overflow-hidden border border-surface-container-highest/50 relative">
            <div className="h-2 bg-gradient-to-r from-primary via-primary-container to-secondary-fixed"></div>
            <div className="p-12 relative z-10">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <h4 className="text-3xl font-black text-primary tracking-tighter font-headline">Kliq</h4>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">From</p>
                    <p className="text-sm font-bold">{(session.user as any).name || "Studio"}</p>
                    <p className="text-sm text-on-surface-variant">{(session.user as any).email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Invoice Issue Date</h5>
                  <p className="font-bold">{new Date(serialized.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-end border-b border-surface-container pb-6 mb-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Bill To</p>
                  <p className="text-xl font-bold">{serialized.clientId?.name || 'Client Name'}</p>
                  <p className="text-sm text-on-surface-variant">{serialized.clientId?.email || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Amount Due</p>
                  <p className="text-3xl font-black text-primary font-headline tracking-tighter">₦ {Number(serialized.amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4 mb-16">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-on-surface-variant border-b border-surface-container pb-3">
                  <span>Description of Service</span>
                  <span>Total</span>
                </div>
                <div className="flex justify-between items-start py-2">
                  <div className="max-w-[70%]">
                    <p className="font-bold text-lg font-headline">{serialized.serviceDetails || 'Design Services'}</p>
                  </div>
                  <p className="font-bold text-lg font-headline">₦ {Number(serialized.amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-end relative z-10">
                <div className="flex-1 p-6 rounded-2xl bg-surface-container-low border-l-4 border-secondary-fixed">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Payment Terms / Notes</p>
                  <p className="text-sm text-on-surface italic leading-relaxed">&quot;{serialized.notesTerms || 'Thank you for your business.'}&quot;</p>
                  <p className="text-xs font-bold text-error mt-4">Due strict by: {serialized.dueDate ? new Date(serialized.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="ml-8 text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Scan to Pay Instantly</p>
                  <InvoicePaperQRCode value={link} size={90} />
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-center opacity-5 grayscale pointer-events-none absolute bottom-4 w-full left-0 z-0 overflow-hidden">
              <h4 className="text-[10rem] font-black text-primary tracking-tighter italic select-none">Kliq</h4>
            </div>
          </div>
        </section>

        {/* Right Side: Actions & Links */}
        <section className="lg:col-span-4 space-y-6">
          <InvoiceActionsClient
            paymentLink={link}
            isPaid={serialized.status === 'paid'}
            invoiceId={serialized._id}
            clientPhone={serialized.clientId?.phone}
          />

          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
            <h3 className="font-bold font-headline mb-4 text-error">Danger Zone</h3>
            <button className="w-full p-3 bg-error-container text-on-error-container font-bold text-sm rounded-xl hover:bg-error hover:text-white transition-colors text-center">
              Delete Invoice
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
