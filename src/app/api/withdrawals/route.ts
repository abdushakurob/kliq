import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Withdrawal from "@/models/Withdrawal";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const withdrawals = await Withdrawal.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json({ withdrawals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await req.json();
    const userId = (session.user as any).id;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 });
    }

    await dbConnect();
    
    // 1. Check Available Balance
    const paidInvoices = await Invoice.find({ userId, status: "paid" });
    const successfulWithdrawals = await Withdrawal.find({ userId, status: { $in: ["pending", "success"] } });

    const totalEarned = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const totalWithdrawn = successfulWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    
    const available = totalEarned - totalWithdrawn;

    if (amount > available) {
      return NextResponse.json({ error: `Insufficient balance. Available: ₦${available.toLocaleString()}` }, { status: 400 });
    }

    // 2. Get User Bank Details
    const User = (await import("@/models/User")).default;
    const user = await User.findById(userId);

    if (!user?.payoutAccountNumber || !user?.payoutBankCode) {
      return NextResponse.json({ error: "Please set your bank details in Settings first." }, { status: 400 });
    }

    // 3. Initiate Squad Payout
    const squadSecret = process.env.SQAD_TEST_KEY;
    const reference = `WDL_${userId}_${Date.now()}`;

    const squadRes = await fetch("https://sandbox-api-d.squadco.com/payout/transfer", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${squadSecret}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Kobo
        bank_code: user.payoutBankCode,
        account_number: user.payoutAccountNumber,
        account_name: user.payoutAccountName || "Kliq Merchant",
        currency: "NGN",
        transaction_reference: reference
      })
    });

    const squadData = await squadRes.json();

    // 4. Record Withdrawal
    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      bankCode: user.payoutBankCode,
      accountNumber: user.payoutAccountNumber,
      accountName: user.payoutAccountName || "Kliq Merchant",
      status: squadRes.ok && squadData.status === 200 ? "success" : "failed",
      transactionReference: reference,
      failureReason: squadRes.ok ? null : squadData.message
    });

    if (!squadRes.ok || squadData.status !== 200) {
      return NextResponse.json({ error: squadData.message || "Payout failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, withdrawal });

  } catch (err: any) {
    console.error("Withdrawal API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
