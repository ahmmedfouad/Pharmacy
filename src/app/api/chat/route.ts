import { NextResponse } from "next/server";
import { OpenAI } from "openai";
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

    // Default system instructions (Strict Pharmacist RAG profile)
    let systemPrompt = `You are an expert, highly accurate pharmacist. You must answer ONLY using the provided medical data from the database. Do not hallucinate or invent medical advice. If the user asks about something not in the provided context, politely apologize and advise consulting a doctor.`;

    // Local JSON search logic
    let searchResults = "";
    try {
      const dbPath = path.join(process.cwd(), "medicines.json");
      if (fs.existsSync(dbPath)) {
        const rawParams = fs.readFileSync(dbPath, "utf-8");
        const medicinesDb = JSON.parse(rawParams);
        
        // Very basic RAG text-matching search
        const query = message ? message.toLowerCase() : "";
        const matched = medicinesDb.filter((med: any) => 
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
    const apiMessages: any[] = [
      { role: "system", content: systemPrompt }
    ];
    let modelName = "llama-3.1-8b-instant";
    let hasImages = false;

    if (body.messages && Array.isArray(body.messages)) {
      // Process full history to retain context
      const history = body.messages.filter((m: any) => m.id !== 1); // Skip default welcome message
      
      for (const msg of history) {
        const role = msg.role === "ai" ? "assistant" : "user";
        
        if (role === "user") {
          if (msg.images && msg.images.length > 0) {
            hasImages = true;
            const contentArray: any[] = [];
            if (msg.content) {
              contentArray.push({ type: "text", text: msg.content });
            } else {
              contentArray.push({ type: "text", text: "Please analyze the provided data." });
            }
            msg.images.forEach((img: string) => {
              contentArray.push({ type: "image_url", image_url: { url: img } });
            });
            apiMessages.push({ role, content: contentArray });
          } else {
            apiMessages.push({ role, content: msg.content || "Please analyze the provided data." });
          }
        } else {
          apiMessages.push({ role, content: msg.content || "" });
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
      modelName = "meta-llama/llama-4-scout-17b-16e-instruct";
    }

    // Make the API call using Groq
    const chatCompletion = await openai.chat.completions.create({
      model: modelName,
      messages: apiMessages,
      temperature: 0.1 // Keep it low for strict factual accuracy
    });

    const generatedText = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ response: generatedText });
  } catch (error: any) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch from Groq API" }, { status: 500 });
  }
}
