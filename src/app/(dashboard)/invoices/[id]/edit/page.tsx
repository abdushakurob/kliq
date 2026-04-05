"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    serviceDescription: "",
    amount: "",
    dueDate: "",
    notesTerms: "",
    status: "draft"
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices`);
        if (!res.ok) throw new Error("Failed to fetch invoices");
        const data = await res.json();
        const invoice = data.invoices.find((inv: any) => inv._id === resolvedParams.id);
        
        if (!invoice) {
          throw new Error("Invoice not found");
        }

        if (invoice.status === 'paid') {
          router.push(`/invoices/${resolvedParams.id}`);
          return;
        }

        setFormData({
          clientName: invoice.clientId?.name || "",
          clientEmail: invoice.clientId?.email || "",
          serviceDescription: invoice.serviceDetails || invoice.serviceDescription || "",
          amount: invoice.amount ? invoice.amount.toString() : "",
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
          notesTerms: invoice.notesTerms || "",
          status: invoice.status || "draft"
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [resolvedParams.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateInvoice = async (status: "draft" | "sent") => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/invoices/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status, amount: Number(formData.amount) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update invoice");
      }

      router.push(`/invoices/${resolvedParams.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <>
      <header className="mb-10 flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary font-headline">Edit Invoice</h2>
          <p className="text-on-surface-variant font-medium">Update details for this billing record</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-primary font-headline">Status</p>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">{formData.status}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="User"
              className="w-full h-full object-cover"
              src={session?.user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuDhYQ6bM_quYbfE7N5Uuwjamulo8O70eiaaa1HvpJjh_wEQd8KTplrCND36fRP5H-_rI5bZjTZBIf4cBLUKTRILh_5Rrcy1MGtsV7KsNBw03U-GB4zns-8zroN2Gyu490gXBDxoZfxs2FLfqD6MEmHs6lP1glhEfMky3DqsbDrKZHTx61pW5sUi3_zYH06AAHgpUBpsIAwL4LvCWIFjJ3nInduNFMbE5PH_aY25VhEsZquUmwpYmeHFvZx3sLyKQBNjson3zcvi8oc"}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Forms */}
        <section className="lg:col-span-7 space-y-8">
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Manual Form */}
          <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Client Name</label>
                  <input name="clientName" value={formData.clientName} onChange={handleChange} className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="E.g. Kolawole Adedeji" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Email Address</label>
                  <input name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="client@company.com" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Service Description</label>
                <input name="serviceDescription" value={formData.serviceDescription} onChange={handleChange} className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="E.g. 3-hour Outdoor Photography" type="text" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Amount (NGN)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₦</span>
                    <input name="amount" value={formData.amount} onChange={handleChange} className="w-full h-14 pl-10 pr-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-bold" placeholder="50000" type="number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Due Date</label>
                  <input name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Notes / Terms</label>
                <textarea name="notesTerms" value={formData.notesTerms} onChange={handleChange} className="w-full p-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium resize-none" placeholder="Include bank details or specific terms..." rows={3}></textarea>
              </div>
            </form>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleUpdateInvoice("sent")}
              disabled={saving}
              className="flex-1 h-16 rounded-2xl bg-secondary-fixed text-on-secondary-fixed font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-secondary-fixed/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>update</span>
              {saving ? "Updating..." : "Update & Set as Sent"}
            </button>
            <button
              onClick={() => handleUpdateInvoice("draft")}
              disabled={saving}
              className="px-8 h-16 rounded-2xl bg-surface-container-highest text-primary font-bold hover:bg-surface-dim transition-colors disabled:opacity-70"
            >
              Update Draft
            </button>
          </div>
        </section>

        {/* Right Column: Live Preview */}
        <section className="lg:col-span-5 sticky top-8">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary/5 overflow-hidden border border-surface-container-highest/50 relative">
            <div className="h-2 bg-gradient-to-r from-primary via-primary-container to-secondary-fixed"></div>
            <div className="p-10 relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h4 className="text-2xl font-black text-primary tracking-tighter font-headline">Kliq</h4>
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">From</p>
                    <p className="text-sm font-bold">{session?.user?.name || "Business Name"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Invoice Preview</h5>
                  <div className="bg-surface-container-highest text-on-surface text-[10px] font-bold px-2 py-1 rounded-full inline-block uppercase">{formData.status}</div>
                </div>
              </div>

              <div className="flex justify-between items-end border-b border-surface-container pb-6 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Bill To</p>
                  <p className="text-xl font-bold">{formData.clientName || 'Client Name'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Amount Due</p>
                  <p className="text-3xl font-black text-primary font-headline tracking-tighter">₦ {Number(formData.amount || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4 mb-16">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-surface-container pb-3">
                  <span>Description</span>
                  <span>Total</span>
                </div>
                <div className="flex justify-between items-start py-2">
                  <div className="max-w-[70%]">
                    <p className="font-bold text-lg font-headline leading-tight">{formData.serviceDescription || 'Design Services'}</p>
                  </div>
                  <p className="font-bold text-lg font-headline">₦ {Number(formData.amount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex justify-center opacity-5 grayscale pointer-events-none absolute bottom-4 w-full left-0 z-0 overflow-hidden">
              <h4 className="text-[9rem] font-black text-primary tracking-tighter italic select-none">Kliq</h4>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
