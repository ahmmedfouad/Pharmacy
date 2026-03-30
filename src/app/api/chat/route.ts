import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages, language } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key." }, { status: 500 });
    }

    const langName = language === 'ar' ? 'Arabic' : 'English';

    // Initialize the model
    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: `You are an expert pharmacist and medical imaging AI. Your job is to provide accurate information about medications, active ingredients, alternatives, and side effects. You are also capable of analyzing medical images such as X-rays and CT scans to provide an overview and description.
CRITICAL RULES:
1. Always respond in ${langName}.
2. Always use relevant emojis throughout your response to make it easy to read and friendly.
3. Depending on the medicine's category, always provide helpful guides or tips (e.g., best time to take, dietary restrictions, how to store it).
4. If the user provides an image (pill, prescription, X-ray, or CT scan), identify it and explain its uses or provide a descriptive overview.
5. Do NOT answer any non-medical questions.
6. Always advise the user to consult a real certified doctor or radiologist before taking any medication or drawing conclusions from scan descriptions, as you are an AI and can make mistakes.`
    });

    // Map frontend messages into Gemini's history / contents format format
    // Exclude the hardcoded intro message from the frontend (id: 1) to avoid confusing the API 
    // since the conversation must logically start with a user message for many LLMs.
    const apiContents = messages
      .filter((msg: any) => msg.id !== 1)
      .map((msg: any) => {
        const parts: any[] = [{ text: msg.content || "Analyze the provided image(s)." }];
        
        if (msg.images && Array.isArray(msg.images)) {
          msg.images.forEach((imgBase64: string) => {
            const mimeTypeMatch = imgBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (mimeTypeMatch) {
              parts.push({
                inlineData: {
                  mimeType: mimeTypeMatch[1],
                  data: mimeTypeMatch[2]
                }
              });
            }
          });
        }

        return {
          role: msg.role === "ai" ? "model" : "user",
          parts: parts
        };
      });

    // Generate response using full contextual history
    const result = await model.generateContent({ contents: apiContents });
    
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
