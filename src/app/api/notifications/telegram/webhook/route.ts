import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { message } = payload;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const chatId = message.chat.id;

    // Handle /start or /verify
    if (text.startsWith("/verify") || text.startsWith("/start")) {
      const parts = text.split(" ");
      const code = parts[1];

      if (!code) {
        await sendTelegramMessage(chatId, "❌ Please provide your verification code. Example: `/verify 123456`", "Markdown");
        return NextResponse.json({ ok: true });
      }

      await dbConnect();
      const user = await User.findOne({
        telegramVerificationCode: code,
        telegramVerificationExpires: { $gt: new Date() }
      });

      if (!user) {
        await sendTelegramMessage(chatId, "❌ Invalid or expired verification code. Please check your Kliq settings and try again.", "Markdown");
        return NextResponse.json({ ok: true });
      }

      // Link the account!
      user.telegramId = chatId.toString();
      user.telegramVerificationCode = undefined;
      user.telegramVerificationExpires = undefined;
      user.telegramConnectedAt = new Date();
      await user.save();

      await sendTelegramMessage(chatId, `✅ *Account Linked!*\n\nWelcome ${user.name}, your Kliq account is now connected. You will receive instant notifications here when clients pay your invoices.`, "Markdown");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

async function sendTelegramMessage(chatId: string | number, text: string, parseMode?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: parseMode
    }),
  });
}
