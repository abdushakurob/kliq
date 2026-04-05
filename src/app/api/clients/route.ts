import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Client from "@/models/Client";
import Invoice from "@/models/Invoice";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await dbConnect();

    // Fetch all clients for the user
    const clients = await Client.find({ userId }).sort({ createdAt: -1 }).lean();

    // Fetch all invoices to compute aggregates
    const invoices = await Invoice.find({ userId }).lean();

    const clientsWithStats = clients.map((client) => {
      const clientInvoices = invoices.filter(
        (inv) => inv.clientId.toString() === client._id.toString()
      );

      const totalBilled = clientInvoices.reduce(
        (acc, curr) => acc + (Number(curr.amount) || 0),
        0
      );

      return {
        ...client,
        totalBilled,
        invoiceCount: clientInvoices.length,
        lastActive: clientInvoices.length > 0
          ? clientInvoices.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0].createdAt
          : client.createdAt,
      };
    });

    return NextResponse.json({ success: true, clients: clientsWithStats }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, email, phone, company } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    await dbConnect();

    const newClient = await Client.create({
      userId,
      name,
      email,
      phone,
      company
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create client:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
