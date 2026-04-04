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

    // Squad typical event structure simulation
    if (payload.Event === 'charge.completed' || payload.event === 'charge.completed') {
       const transactionRef = payload.Body?.transaction_ref || payload.body?.transaction_ref;
       const invoiceId = payload.Body?.meta?.invoiceId || payload.body?.meta?.invoiceId;

       await dbConnect();
       // Explicitly init user so mongoose can populate it
       User.init();
       
       if (invoiceId) {
         // Mark invoice as paid and fetch the studio user to trigger notifications
         const updatedInvoice = await Invoice.findByIdAndUpdate(
           invoiceId, 
           { status: "paid" },
           { new: true }
         ).populate("userId");

         // Create a standalone transaction log
         await Transaction.create({
            invoiceId,
            amount: Number(payload.Body?.amount || 0) / 100, // Converts Kobo back to Naira
            provider: "squad",
            providerTransactionId: transactionRef,
            status: "success",
            metadata: payload
         });

         // Telegram Notification Logic
         const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
         const telegramId = (updatedInvoice?.userId as any)?.telegramId;
         
         if (telegramBotToken && telegramId) {
           const message = `🎉 *Payment Received!*\n\nInvoice: ${updatedInvoice._id}\nAmount: ₦${Number(updatedInvoice.amount).toLocaleString()}\nService: ${updatedInvoice.serviceDetails}\n\nThe payment has been secured successfully by Squad.`;
           
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
             console.log("Sent Telegram notification to", telegramId);
           } catch (teleErr) {
             console.error("Failed to push Telegram notification", teleErr);
           }
         }
       }
    }

    // Always respond 200 OK to webhooks to prevent retries
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Webhook processing error", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
