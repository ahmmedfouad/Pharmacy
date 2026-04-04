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
      console.error("GROQ_API_KEY is missing");
      return NextResponse.json({ 
        error: "Translation service not configured",
        translatedMessages: messages // Return original messages as fallback
      }, { status: 500 });
    }

    const langName = targetLanguage === "ar" ? "Arabic" : "English";
    const sourceLang = targetLanguage === "ar" ? "English" : "Arabic";
    const systemPrompt = `You are a specialized medical translation assistant. Translate the messages from ${sourceLang} to ${langName} while keeping the meaning EXACT and professional.
    
CRITICAL RULES:
1. Return a JSON object with "translatedMessages" array
2. Each message must have: role, content
3. Translate ONLY the content field
4. Keep all medical terminology accurate
5. Preserve ALL markdown formatting (**bold**, *italic*, lists, etc.)
6. Keep ALL emojis exactly as they are
7. Preserve ALL line breaks and spacing
8. Keep error messages format like "**Error:**" or "**خطأ:**"
9. Do NOT translate technical terms in [brackets]
10. Ensure medical accuracy and professional tone in the target language.
11. Do NOT add any extra text or commentary.
12. ABSOLUTELY NO foreign characters (like Chinese, Japanese, etc.). Use ONLY the standard ${langName} alphabet and punctuation.`;
    
    const prompt = `Translate these messages from ${sourceLang} to ${langName}. Return ONLY a JSON object with format: {"translatedMessages": [{"role": "...", "content": "..."}]}\n\nMessages: ${JSON.stringify(messages)}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Using more powerful model for better translations
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3 // Lower temperature for more consistent translations
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Physically strip any Chinese/Japanese/Korean characters to prevent hallucination leaks
    const cleanResponseText = responseText.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g, "");
    
    let translatedMessages = messages; // Fallback to original messages
    
    try {
      const parsed = JSON.parse(cleanResponseText);
      
      // Handle different response formats
      if (parsed.translatedMessages && Array.isArray(parsed.translatedMessages)) {
        translatedMessages = parsed.translatedMessages;
      } else if (Array.isArray(parsed)) {
        translatedMessages = parsed;
      } else if (parsed.messages && Array.isArray(parsed.messages)) {
        translatedMessages = parsed.messages;
      } else {
        console.warn("Unexpected translation response format:", parsed);
        // Keep original messages as fallback
      }
      
      // Validate translated messages have same length
      if (translatedMessages.length !== messages.length) {
        console.warn(`Translation length mismatch: expected ${messages.length}, got ${translatedMessages.length}`);
        translatedMessages = messages; // Fallback to original
      }
      
    } catch (parseError) {
      console.error("Failed to parse translation response:", responseText, parseError);
      // Return original messages as safe fallback
      translatedMessages = messages;
    }

    return NextResponse.json({ 
      translatedMessages,
      success: true 
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    
    let errorMessage = "Translation failed";
    let statusCode = 500;
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = "Unable to connect to translation service";
      statusCode = 503;
    } else if (error.status === 429) {
      errorMessage = "Too many translation requests. Please wait a moment.";
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, code: error.code || 'TRANSLATION_ERROR' },
      { status: statusCode }
    );
  }
}

