import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // 🔍 1. VERBOSE LOGGING - See exactly what Squad sends
    console.log("-----------------------------------------");
    console.log("📥 WEBHOOK RECEIVED AT:", new Date().toISOString());
    console.log("Event:", payload.Event || payload.event);
    
    const body = payload.Body || payload.body;
    const event = payload.Event || payload.event;
    
    // We only care about success
    if (event !== 'charge_successful' && event !== 'charge.completed') {
      console.log("ℹ️ Skipping non-success event:", event);
      return NextResponse.json({ success: true, message: "Ignored event" });
    }

    // 🔍 2. IDENTIFIER EXTRACTION (The "One Flow")
    // We rely ONLY on the invoiceId we put in metadata
    let rawMeta = body?.meta || body?.metadata;
    let meta = rawMeta;

    // Handle cases where providers stringify the metadata object
    if (typeof rawMeta === 'string') {
      try {
        meta = JSON.parse(rawMeta);
      } catch (e) {
        console.error("Failed to parse stringified metadata");
      }
    }

    const invoiceId = meta?.invoiceId;
    console.log("Targeting Invoice ID:", invoiceId);

    if (!invoiceId) {
      console.error("❌ CRITICAL: No invoiceId found in payload metadata.");
      return NextResponse.json({ success: false, error: "No invoice identifier" }, { status: 400 });
    }

    // 🔍 3. DATABASE UPDATE
    await dbConnect();
    // Ensure User model is loaded for population
    if (!mongoose.models.User) {
        await User.init();
    }

    const invoice = await Invoice.findById(invoiceId).populate("userId");

    if (!invoice) {
      console.error("❌ DATABASE MISMATCH: No invoice found with ID:", invoiceId);
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      console.log("✅ Invoice was already marked as PAID.");
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // UPDATE STATUS
    invoice.status = "paid";
    await invoice.save();
    console.log("✅ DB UPDATED: Status set to PAID for", invoice.invoiceNumber);

    // 🔍 4. TELEGRAM NOTIFICATION (Async - don't block the response)
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const user = invoice.userId as any;
    
    if (telegramBotToken && user?.telegramId && user?.telegramConnectedAt) {
      const tgMessage = `💰 *Payment Confirmed!*\n\nInvoice: ${invoice.invoiceNumber}\nAmount: ₦${Number(invoice.amount).toLocaleString()}\nClient: ${(invoice as any).clientId?.name || 'Your Client'}\n\nYour dashboard has been updated.`;
      
      fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: user.telegramId,
          text: tgMessage,
          parse_mode: "Markdown"
        })
      }).catch(err => console.error("Telegram notification failed", err));
    }

    // 🔍 5. LOG TRANSACTION
    await Transaction.create({
      invoiceId: invoice._id,
      amount: Number(body?.amount || 0) / 100,
      paymentProvider: "squad",
      providerTransactionId: body?.transaction_ref || body?.transaction_reference,
      status: "success",
      metadata: payload
    }).catch(err => console.error("Failed to create transaction record", err));

    console.log("-----------------------------------------");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ WEBHOOK CRASH:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper to ensure mongoose types are available without full import overhead here
import mongoose from "mongoose";
