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
      You are the Kliq Pricing Coach and AI Assistant.
      Your job is to converse with the user to gather info to generate a professional invoice.
      Required info: Client Name, Service Description, Amount.
      If info is missing, formulate a friendly question asking for it.
      If the user asks for pricing advice, give them a recommendation based on their input.
      Once you have gathered enough parameters, give a friendly confirmation statement, and append a JSON block exactly containing:
      \`\`\`json
      {
         "clientName": "...",
         "serviceDetails": "...",
         "amount": 0,
         "dueDate": "YYYY-MM-DD"
      }
      \`\`\`
      Only output the JSON block when the invoice data is thoroughly complete in the conversation history.
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
