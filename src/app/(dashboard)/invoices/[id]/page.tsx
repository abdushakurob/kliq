import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/models/Invoice";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  await dbConnect();

  // Find Invoice
  const invoice = await Invoice.findOne({
    _id: params.id,
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
          <div className="bg-white rounded-[2rem] shadow-[0_12px_40px_rgba(0,52,52,0.04)] overflow-hidden border border-surface-container-highest/50 relative">
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
                  <p className="text-sm text-on-surface-variant">{serialized.clientId?.email || 'client@email.com'}</p>
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

              <div className="mt-12 p-6 rounded-2xl bg-surface-container-low border-l-4 border-secondary-fixed">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Payment Terms / Notes</p>
                <p className="text-sm text-on-surface italic leading-relaxed">&quot;{serialized.notesTerms || 'Thank you for your business.'}&quot;</p>
                <p className="text-xs font-bold text-error mt-4">Due strict by: {serialized.dueDate ? new Date(serialized.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="mt-12 flex justify-center opacity-5 grayscale pointer-events-none absolute bottom-4 w-full left-0 z-0 overflow-hidden">
              <h4 className="text-[10rem] font-black text-primary tracking-tighter italic select-none">Kliq</h4>
            </div>
          </div>
        </section>

        {/* Right Side: Actions & Links */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
            <h3 className="font-bold font-headline mb-4">Share with Client</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Clients can view this invoice online and drop a payment instantly using their card or transfer.
            </p>

            <div className="relative mb-6">
              <input
                readOnly
                value={link}
                className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-4 pr-12 text-sm font-medium text-on-surface truncate outline-none"
              />
              {/* Copy Button component placeholder. Normally we use client-side logic to copy, keeping this simple. */}
            </div>

            <Link
              href={serialized.status === 'draft' ? `/invoices/${serialized._id}/edit` : `/pay/${serialized._id}`}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              target="_blank"
            >
              <span className="material-symbols-outlined text-sm border border-white/50 p-1 rounded-md">open_in_new</span>
              View Live Link
            </Link>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
            <h3 className="font-bold font-headline mb-4 text-on-surface">Manage Invoice</h3>
            <div className="space-y-3">
              <button disabled={serialized.status === 'paid'} className="w-full text-left flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="text-sm font-medium">Mark as Paid</span>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">check_circle</span>
              </button>
              <button className="w-full text-left flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                <span className="text-sm font-medium">Download PDF</span>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">download</span>
              </button>
            </div>
          </div>

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
