"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";

export default function InvoiceActionsClient({ paymentLink, isPaid, invoiceId, clientPhone }: { paymentLink: string, isPaid: boolean, invoiceId: string, clientPhone?: string }) {
  const [showQR, setShowQR] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  const handleDownloadPDF = async () => {
    const invoiceEl = document.getElementById("invoice-paper");
    if (!invoiceEl) return;
    
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(invoiceEl, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Invoice_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Hi, here is the invoice for our project. You can view and pay it securely here: ${paymentLink}`);
    const phone = clientPhone ? clientPhone.replace(/\D/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleMarkAsPaid = async () => {
    if (!window.confirm("Are you sure you want to mark this invoice as paid?")) return;
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" })
      });
      if (res.ok) {
        alert("Invoice marked as paid!");
        router.refresh();
      } else {
        alert("Failed to mark as paid");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadImage = async () => {
    const invoiceEl = document.getElementById("invoice-paper");
    if (!invoiceEl) return;
    
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(invoiceEl, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = `Invoice_${new Date().toISOString().split("T")[0]}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to download image", err);
      alert("Failed to download the invoice image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    alert("Payment link copied to clipboard!");
  };

  return (
    <>
      <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
        <h3 className="font-bold font-headline mb-4">Share with Client</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          Clients can view this invoice online and drop a payment instantly using their card or transfer.
        </p>

        <div className="relative mb-6">
          <input
            readOnly
            value={paymentLink}
            className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-4 pr-12 text-sm font-medium text-on-surface truncate outline-none cursor-copy"
            onClick={copyToClipboard}
          />
          <button 
            type="button"
            onClick={copyToClipboard}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 h-12 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            Share on WhatsApp
          </button>
          <a
            href={paymentLink}
            className="w-12 h-12 rounded-xl bg-surface-container-high text-primary font-bold flex items-center justify-center hover:bg-surface-container transition-colors shrink-0"
            target="_blank"
            rel="noreferrer"
            title="Open Live Link"
          >
            <span className="material-symbols-outlined text-xl">open_in_new</span>
          </a>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
        <h3 className="font-bold font-headline mb-4 text-on-surface">Manage Invoice</h3>
        <div className="space-y-3">
          <button 
            disabled={isPaid} 
            onClick={handleMarkAsPaid}
            className="w-full text-left flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <span className="text-sm font-medium">Mark as Paid</span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">check_circle</span>
          </button>
          {!isPaid && (
            <button 
              onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
              className="w-full text-left flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors"
            >
              <span className="text-sm font-medium">Edit Invoice</span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">edit</span>
            </button>
          )}
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full text-left flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <span className="text-sm font-medium">{isDownloading ? "Generating PDF..." : "Download PDF"}</span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">picture_as_pdf</span>
          </button>
          <button 
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="w-full text-left flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <span className="text-sm font-medium">{isDownloading ? "Downloading..." : "Download Image (PNG)"}</span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">download</span>
          </button>
        </div>
      </div>


      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <div 
            className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-headline font-black text-xl mb-2 text-primary">Scan to Pay</h3>
            <p className="text-on-surface-variant text-sm mb-8 text-center max-w-[250px]">Point your camera at this code to open the secure payment portal.</p>
            
            <div className="bg-white p-4 rounded-2xl border-4 border-surface-container mb-8">
              <QRCode value={paymentLink} size={200} fgColor="#003434" />
            </div>

            <button 
              onClick={() => setShowQR(false)}
              className="w-full h-12 rounded-xl bg-surface-container-high text-on-surface font-bold hover:bg-surface-container transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
