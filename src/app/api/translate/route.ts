import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// We use the 2.5 flash model that the user had success with
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are a specialized translation assistant for a pharmacy and medical chatbot app. Your job is to translate an array of chat messages EXACTLY between English and Arabic. Return a JSON array of objects with 'id', 'role' and 'content' properties, translating ONLY the text inside 'content'. Keep all emojis and medical formatting intact. DO NOT add any extra commentary outside the JSON array.",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

export async function POST(req: Request) {
  try {
    const { messages, targetLanguage } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ translatedMessages: [] });
    }

    const langName = targetLanguage === "ar" ? "Arabic" : "English";
    const prompt = `Please translate the following chat transcript into ${langName}. Make sure to return it as a pure JSON array exactly matching the input structure (id, role, content), where only 'content' is translated.\n\nInput messages: ${JSON.stringify(messages)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let translatedMessages = messages; // Fallback in case of parse error
    try {
      translatedMessages = JSON.parse(responseText);
    } catch (parseError) {
      console.warn("Could not parse JSON from translation response:", responseText);
    }

    return NextResponse.json({ translatedMessages });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate messages" },
      { status: 500 }
    );
  }
}
