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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const body = await req.json();
    const { text } = body;
    
    if (!text) return NextResponse.json({ error: "Missing 'text' parameter." }, { status: 400 });

    const prompt = `
      You are an expert invoice data extractor for a creative studio application called Kliq.
      Extract the following information from the user's natural language input:
      1. clientName (string): The name of the client, individual, or company they are charging.
      2. serviceDetails (string): A short professional phrase summarizing the services rendered (e.g. "Logo Design", "Architectural Rendering").
      3. amount (number): The total amount to be charged. Infer numbers accurately (e.g. "50k" -> 50000, "2M" -> 2000000). Only return flat number value.
      4. dueDate (string): The YYYY-MM-DD date representation of the due date. Reference today which is: ${new Date().toISOString()}.

      User Input: "${text}"

      Respond ONLY with a JSON object exactly matching this schema:
      {
         "clientName": "Extracted Name or leave empty",
         "serviceDetails": "Extracted services",
         "amount": 0,
         "dueDate": "YYYY-MM-DD"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json({ success: true, parsed: data }, { status: 200 });

  } catch (error: any) {
    console.error("AI parse error:", error);
    return NextResponse.json({ error: error.message || "Failed to process AI Magic Input." }, { status: 500 });
  }
}
