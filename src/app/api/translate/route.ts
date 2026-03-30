import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { messages, targetLanguage } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ translatedMessages: [] });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY." }, { status: 500 });
    }

    const langName = targetLanguage === "ar" ? "Arabic" : "English";
    const systemPrompt = "You are a specialized translation assistant for a pharmacy and medical chatbot app. Your job is to translate an array of chat messages EXACTLY between English and Arabic. Return a JSON array of objects with 'id', 'role' and 'content' properties, translating ONLY the text inside 'content'. Keep all emojis and medical formatting intact. DO NOT add any extra commentary outside the JSON array.";
    
    const prompt = `Please translate the following chat transcript into ${langName}. Make sure to return it as a pure JSON array exactly matching the input structure (id, role, content), where only 'content' is translated.\n\nInput messages: ${JSON.stringify(messages)}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "[]";
    
    let translatedMessages = messages; // Fallback in case of parse error
    try {
      // Groq might return {"translatedMessages": [...]} if asked nicely, or just the JSON array.
      // Let's try parsing directly.
      let parsed = JSON.parse(responseText);
      if (parsed.translatedMessages) {
        translatedMessages = parsed.translatedMessages;
      } else if (Array.isArray(parsed)) {
        translatedMessages = parsed;
      }
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

