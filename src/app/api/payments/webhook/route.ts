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

    // Squad typical event structure
    if (payload.Event === 'charge.completed' || payload.event === 'charge.completed') {
      const transactionRef = payload.Body?.transaction_ref || payload.body?.transaction_ref;
      const id = payload.Body?.meta?.invoiceId || payload.body?.meta?.invoiceId;

      await dbConnect();
      User.init(); // Explicitly init user so mongoose can populate it

      if (id) {
        // Find the invoice: try by ID first, then by invoiceNumber (human ref)
        let invoice = await Invoice.findById(id).populate("userId");
        if (!invoice) {
          invoice = await Invoice.findOne({ invoiceNumber: id }).populate("userId");
        }

        if (invoice) {
          // Mark as paid
          invoice.status = "paid";
          await invoice.save();

          // Create a standalone transaction log
          await Transaction.create({
            invoiceId: invoice._id,
            amount: Number(payload.Body?.amount || 0) / 100, // Converts Kobo back to Naira
            paymentProvider: "squad",
            providerTransactionId: transactionRef,
            status: "success",
            metadata: payload
          });

          // Telegram Notification Logic
          const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
          const userDoc = (invoice.userId as any);
          const telegramId = userDoc?.telegramId;
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
            } catch (teleErr) {
              console.error("Failed to push Telegram notification", teleErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Webhook processing error", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
