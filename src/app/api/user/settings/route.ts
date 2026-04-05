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
    const user = await User.findById((session.user as any).id, "name email phone telegramId whatsappId").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
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

    const { name, phone, telegramId, whatsappId } = await req.json();

    await dbConnect();
    
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Logic for Telegram Verification Code
    let verificationCode = user.telegramVerificationCode;
    if (telegramId && telegramId !== user.telegramId && !user.telegramConnectedAt) {
      // Generate a new 6-digit code if it doesn't exist or is a new handle
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.telegramVerificationCode = verificationCode;
      user.telegramVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.whatsappId = whatsappId || user.whatsappId;
    // We don't update telegramId directly to the numeric ID here, 
    // it stays as the handle/username until the bot verifies it.
    user.telegramId = telegramId || user.telegramId; 

    await user.save();

    return NextResponse.json({ 
      success: true, 
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        telegramId: user.telegramId,
        whatsappId: user.whatsappId,
        telegramVerificationCode: user.telegramVerificationCode,
        telegramConnected: !!user.telegramConnectedAt
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
