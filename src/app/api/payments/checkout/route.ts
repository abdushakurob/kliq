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
      invoiceId: invoice._id.toString(),
      amount: Number(invoice.amount),
      customerEmail: invoice.clientId?.email || "customer@example.com",
      customerName: invoice.clientId?.name || "Valued Customer"
    });

    // In a real environment, redirect to the returned provider portal URL.
    // For this demonstration, we are simulating a redirect that actually auto-verifies via the webhook,
    // or you'd just redirect directly to `https://sandbox.squadco.com/pay/...`
    return NextResponse.redirect(new URL(`/pay/${invoiceId}?simulated_payment=success`, req.url), 303);

  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.redirect(new URL("/?error=checkout_failed", req.url));
  }
}
