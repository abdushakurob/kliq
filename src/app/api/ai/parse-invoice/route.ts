import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.GEMINI_API_KEY) {
       return NextResponse.json(
         { error: "GEMINI_API_KEY is missing. Please add it to your .env.local file to use the AI Pricing Coach." },
         { status: 500 }
       );
    }

    const body = await req.json();
    const { messages } = body; 
    
    if (!messages || !messages.length) return NextResponse.json({ error: "Missing 'messages' array parameter." }, { status: 400 });

    const systemInstruction = `
      You are the Kliq Invoice Assistant.
      Your job is to converse with the user to gather info for a professional invoice.

      IMPORTANT RULES:
      1. CLIENT FOCUS: The names and entities mentioned by the user are the CLIENT'S names or BUSINESS names (the person/entity being billed). You do NOT need the user's name. 
      2. SUGGEST DESCRIPTIONS: If the user provides a vague service description, suggest a more professional, clear line item.
      3. EMAIL: The client email is optional. If provided, capture it. If not, don't worry about it, but acknowledge it can be added.
      4. Required info: Client Name, Service Description, Amount.
      5. TONE: Friendly, professional, and commercially savvy advisor for Nigerian creatives.

      Once you have gathered parameters, SILENTLY append this JSON block at the very end of your response:
      \`\`\`json
      {
         "clientName": "...",
         "clientEmail": "...",
         "serviceDetails": "...",
         "amount": 0,
         "dueDate": "YYYY-MM-DD"
      }
      \`\`\`
      Only output the JSON block when the invoice data is complete.
      Today is ${new Date().toISOString()}.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
       model: "gemini-2.5-flash",
       systemInstruction: {
         role: "system",
         parts: [{ text: systemInstruction }]
       }
    });

    const chat = model.startChat({
        history: messages.slice(0, -1) // Provide history except the latest message
    });

    const userMessageText = messages[messages.length - 1].parts[0].text;
    const result = await chat.sendMessage(userMessageText);
    const responseText = result.response.text();

    let parsedExtract = null;
    let cleanText = responseText;

    // Check for JSON Extracted Output
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
       try {
         parsedExtract = JSON.parse(jsonMatch[1]);
         cleanText = responseText.replace(jsonMatch[0], "").trim();
       } catch (e) {
          console.error("JSON parse failed", e);
       }
    }

    return NextResponse.json({ success: true, reply: cleanText, parsed: parsedExtract }, { status: 200 });

  } catch (error: any) {
    console.error("AI parse error:", error);
    return NextResponse.json({ error: error.message || "Failed to process AI Magic Input." }, { status: 500 });
  }
}
