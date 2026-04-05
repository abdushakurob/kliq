import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // Note: In production you MUST verify the Squad Security Signature in headers!
    // const squadSignature = req.headers.get("x-squad-signature");

    const payload = await req.json();
    console.log("-----------------------------------------");
    console.log("📥 RECEIVED SQUAD WEBHOOK");
    console.log("Event Type:", payload.Event || payload.event);
    console.log("Payload Body:", JSON.stringify(payload.Body || payload.body, null, 2));

    const event = payload.Event || payload.event;
    const body = payload.Body || payload.body;

    // Squad typical event structure
    // Success events can be 'charge_successful' (official) or 'charge.completed' (some docs)
    if (event === 'charge_successful' || event === 'charge.completed' || event === 'charge_successful') {
      const transactionRef = body?.transaction_ref;
      
      // Extraction of meta/metadata
      const meta = body?.meta || body?.metadata;
      const id = meta?.invoiceId;

      console.log("Looking for Invoice ID:", id);

      if (id) {
        await dbConnect();
        User.init(); // Explicitly init user so mongoose can populate it

        // Find the invoice: try by ID first, then by invoiceNumber (human ref)
        let invoice = await Invoice.findById(id).populate("userId");
        if (!invoice) {
          console.log("Mongoose ID match failed, trying Invoice Number search...");
          invoice = await Invoice.findOne({ invoiceNumber: id }).populate("userId");
        }

        if (invoice) {
          console.log("✅ MATCH FOUND:", invoice.invoiceNumber);
          
          if (invoice.status === "paid") {
             console.log("⚠️ INVOICE IS ALREADY PAID. Skipping update.");
             return NextResponse.json({ success: true, message: "Already processed" });
          }

          // Mark as paid
          invoice.status = "paid";
          await invoice.save();
          console.log("Database status updated to PAID");

          // Create a standalone transaction log
          await Transaction.create({
            invoiceId: invoice._id,
            amount: Number(body?.amount || 0) / 100, // Converts Kobo back to Naira
            paymentProvider: "squad",
            providerTransactionId: transactionRef,
            status: "success",
            metadata: payload
          });
          console.log("Transaction log created");

          // Telegram Notification Logic
          const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
          const userDoc = (invoice.userId as any);
          const telegramId = userDoc?.telegramId; // The numeric chat ID
          const isConnected = !!userDoc?.telegramConnectedAt;

          if (telegramBotToken && telegramId && isConnected) {
            const message = `🎉 *Payment Received!*\n\nInvoice: ${invoice.invoiceNumber}\nAmount: ₦${Number(invoice.amount).toLocaleString()}\nService: ${invoice.serviceDescription}\n\nThe payment has been secured successfully by Squad.`;

            try {
              await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: telegramId,
                  text: message,
                  parse_mode: "Markdown"
                })
              });
              console.log("Telegram notification pushed to handle", userDoc.telegramHandle);
            } catch (teleErr) {
              console.error("Failed to push Telegram notification", teleErr);
            }
          }
        } else {
          console.error("❌ NO MATCHING INVOICE FOUND FOR ID:", id);
        }
      } else {
        console.error("❌ NO INVOICE ID FOUND IN PAYLOAD METADATA");
      }
    } else {
      console.log("ℹ️ SKIPPING EVENT:", event);
    }

    console.log("-----------------------------------------");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Webhook processing error", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
