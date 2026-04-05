import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id, "name email phone telegramHandle whatsappId telegramVerificationCode telegramConnectedAt").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        ...user,
        telegramConnected: !!user.telegramConnectedAt
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, telegramHandle, whatsappId } = await req.json();

    await dbConnect();
    
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Logic for Telegram Handle Change & Verification
    if (telegramHandle && telegramHandle !== user.telegramHandle) {
      // Clear old connection if handle changes
      user.telegramHandle = telegramHandle;
      user.telegramId = undefined; // Clear the numeric ID
      user.telegramConnectedAt = undefined;
      
      // Generate a new 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.telegramVerificationCode = verificationCode;
      user.telegramVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.whatsappId = whatsappId || user.whatsappId;

    await user.save();

    return NextResponse.json({ 
      success: true, 
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        telegramHandle: user.telegramHandle,
        whatsappId: user.whatsappId,
        telegramVerificationCode: user.telegramVerificationCode,
        telegramConnected: !!user.telegramConnectedAt
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
