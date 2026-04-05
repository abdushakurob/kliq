import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import { SquadProvider } from "@/lib/payments/providers/SquadProvider";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const invoiceId = formData.get("invoiceId") as string;

    if (!invoiceId) {
      return NextResponse.redirect(new URL("/?error=missing_invoice", req.url));
    }

    await dbConnect();
    Client.init();

    const invoice = await Invoice.findById(invoiceId).populate("clientId");
    
    if (!invoice) return NextResponse.redirect(new URL("/?error=not_found", req.url));
    
    if (invoice.status === "paid") {
      return NextResponse.redirect(new URL(`/pay/${invoiceId}?error=already_paid`, req.url));
    }

    const squad = new SquadProvider();
    
    const link = await squad.createPaymentLink({
      invoiceId: invoice.invoiceNumber,
      amount: Number(invoice.amount),
      customerEmail: (invoice.clientId as any)?.email || "customer@example.com",
      customerName: (invoice.clientId as any)?.name || "Valued Customer",
      description: invoice.serviceDescription || "Kliq Invoicing Services"
    });

    if (link.paymentLinkUrl) {
      return NextResponse.redirect(link.paymentLinkUrl, 303);
    }

    return NextResponse.redirect(new URL(`/pay/${invoiceId}?error=link_generation_failed`, req.url), 303);

  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.redirect(new URL("/?error=checkout_failed", req.url));
  }
}
