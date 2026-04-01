import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import fs from "fs";
import path from "path";

// Initialize the OpenAI client using the Groq Base URL
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We handle exactly what the user requested: message and imageBase64
    // We also silently fall back to `messages` from the older implementation so the UI doesn't break.
    let message = body.message;
    let imageBase64 = body.imageBase64;
    
    // Fallback for existing UI implementation if it sends `messages` instead of direct strings
    if (!message && body.messages && body.messages.length > 0) {
      const lastMessage = body.messages[body.messages.length - 1];
      message = lastMessage.content;
      if (lastMessage.images && lastMessage.images.length > 0) {
        imageBase64 = lastMessage.images[0]; // grab the first image if there's an array
      }
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY." }, { status: 500 });
    }

    // Default system instructions (Pharmacist & Medical Analyst)
    let systemPrompt = `You are an expert pharmacist and medical image analyzer. 
For medication questions, use the provided database context if available. 
For any provided images (like X-rays, MRIs, CT scans, pill identifiers, or medical prescriptions), you MUST analyze them thoroughly, describe what you see, and provide professional insights. 
Always include a disclaimer that you are an AI and the user should consult with a certified medical professional or radiologist for official medical diagnoses. Do not invent details you cannot see.`;

    // Local JSON search logic
    let searchResults = "";
    try {
      const dbPath = path.join(process.cwd(), "medicines.json");
      if (fs.existsSync(dbPath)) {
        const rawParams = fs.readFileSync(dbPath, "utf-8");
        const medicinesDb = JSON.parse(rawParams);
        
        // Very basic RAG text-matching search
        const query = message ? message.toLowerCase() : "";
        const matched = medicinesDb.filter((med: { name?: string; description?: string }) =>
          med.name?.toLowerCase().includes(query) ||
          med.description?.toLowerCase().includes(query)
        );

        if (matched.length > 0) {
          searchResults = JSON.stringify(matched, null, 2);
        }
      }
    } catch (e) {
      console.warn("Could not read medicines.json for RAG context:", e);
    }
    
    // Inject the match into the context if found
    if (searchResults) {
      systemPrompt += `\n\n--- DATABASE MATCHES ---\n${searchResults}\n------------------------\n`;
    }

    // Construct the payload for OpenAI / Groq including conversation history
    const apiMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt }
    ];
    let hasImages = false;

    if (body.messages && Array.isArray(body.messages)) {
      // Process full history to retain context
      const history = body.messages.filter((m: { id?: number }) => m.id !== 1); // Skip default welcome message

      for (const msg of history) {
        const typedMsg = msg as { role: string; content?: string; images?: string[] };
        const role = typedMsg.role === "ai" ? "assistant" : "user";

        if (role === "user") {
          if (typedMsg.images && typedMsg.images.length > 0) {
            hasImages = true;
            const contentArray: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
            if (typedMsg.content) {
              contentArray.push({ type: "text", text: typedMsg.content });
            } else {
              contentArray.push({ type: "text", text: "Please analyze the provided data." });
            }
            typedMsg.images.forEach((img: string) => {
              contentArray.push({ type: "image_url", image_url: { url: img } });
            });
            apiMessages.push({ role, content: contentArray });
          } else {
            apiMessages.push({ role, content: typedMsg.content || "Please analyze the provided data." });
          }
        } else {
          apiMessages.push({ role, content: typedMsg.content || "" });
        }
      }
    } else {
      // Fallback for single message / direct requests without full history layout
      if (imageBase64) {
        hasImages = true;
        apiMessages.push({
          role: "user",
          content: [
            { type: "text", text: message || "Please analyze the provided data." },
            { type: "image_url", image_url: { url: imageBase64 } }
          ]
        });
      } else {
        apiMessages.push({
          role: "user",
          content: message || "Please analyze the provided data."
        });
      }
    }

    // Switch to Vision model if ANY images exist in the chat history
    if (hasImages) {
      // We use Gemini for high-accuracy vision analysis.
      const geminiClient = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY || "",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
      });

      // Update the system message to be very clear for the Gemini model
      apiMessages[0].content = systemPrompt;

      const chatCompletion = await geminiClient.chat.completions.create({
        model: "gemini-2.5-flash", // High accuracy, super fast, and avoids the 429 quota limits of Pro
        messages: apiMessages,
        temperature: 0.1
      });

      return NextResponse.json({ response: chatCompletion.choices[0]?.message?.content || "" });
    }

    // Regular Text processing using Groq
    const chatCompletion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: apiMessages,
      temperature: 0.1 // Keep it low for strict factual accuracy
    });

    const generatedText = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ response: generatedText });
  } catch (error) {
    console.error("Groq API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch from Groq API";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
