import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bank_code, account_number } = await req.json();

    if (!bank_code || !account_number) {
      return NextResponse.json({ error: "Bank code and account number are required" }, { status: 400 });
    }

    const squadSecret = process.env.SQUAD_SECRET_KEY || process.env.SQAD_TEST_KEY;
    const isSandbox = squadSecret?.startsWith("sk_test") || squadSecret?.startsWith("sandbox_sk_");
    const baseUrl = isSandbox 
      ? "https://sandbox-api-d.squadco.com" 
      : "https://api-d.squadco.com";

    // Squadco Account Lookup API
    const squadRes = await fetch(`${baseUrl}/payout/account/lookup`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${squadSecret}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bank_code,
        account_number
      })
    });

    const squadData = await squadRes.json();

    if (!squadRes.ok || squadData.status !== 200) {
      console.error("[AccountLookup] Squad API Error:", squadData);
      return NextResponse.json({ error: squadData.message || "Account lookup failed" }, { status: 400 });
    }

    if (!squadData.data?.account_name) {
      return NextResponse.json({ error: "Could not verify account name. Please check the details." }, { status: 404 });
    }

    return NextResponse.json({ 
      account_name: squadData.data.account_name,
      bank_name: squadData.data.bank_name 
    });

  } catch (err: any) {
    console.error("Account Lookup Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
