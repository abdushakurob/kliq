import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Client from "@/models/Client";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    await dbConnect();

    const client = await Client.findOneAndDelete({ _id: id, userId });

    if (!client) {
      return NextResponse.json({ error: "Client not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Client deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to delete client:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
