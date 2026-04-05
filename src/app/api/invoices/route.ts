import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import { SquadProvider } from "@/lib/payments/providers/SquadProvider";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { 
      clientName, 
      clientEmail, 
      serviceDescription, 
      amount, 
      dueDate, 
      notesTerms,
      status 
    } = body;

    if (!clientName || !serviceDescription || !amount || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // 1. Find or create the client
    let client = null;
    if (clientEmail) {
      client = await Client.findOne({ userId, email: clientEmail });
    }
    
    if (!client) {
      client = await Client.create({
        userId,
        name: clientName,
        email: clientEmail || undefined,
      });
    }

    // 2. Generate basics
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    let paymentLinkId = undefined;
    let paymentLinkUrl = undefined;

    // 3. If "sent", generate link
    if (status === "sent") {
      try {
        const squad = new SquadProvider();
        const linkRes = await squad.createPaymentLink({
          invoiceId: invoiceNumber,
          amount: Number(amount),
          customerName: clientName,
          customerEmail: clientEmail,
          description: serviceDescription
        });
        paymentLinkId = linkRes.paymentLinkId;
        paymentLinkUrl = linkRes.paymentLinkUrl;
      } catch (err) {
        console.error("Payment Link Generation Failed", err);
      }
    }

    // 4. Create the Invoice
    const invoice = await Invoice.create({
      userId,
      clientId: client._id,
      invoiceNumber,
      serviceDescription,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      notesTerms,
      status: status || "draft",
      paymentLinkId,
      paymentLinkUrl,
      paymentProvider: status === "sent" ? "squad" : undefined
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await dbConnect();

    // Fetch invoices and populate the related Client details
    const invoices = await Invoice.find({ userId })
      .populate("clientId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, invoices }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
