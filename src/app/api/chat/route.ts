import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import fs from "fs";
import path from "path";
import type { UserProfile } from "@/types/user-profile";
import { GENDER_LABELS, CHRONIC_CONDITION_LABELS } from "@/types/user-profile";

// Initialize the OpenAI client using the Groq Base URL
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

/** Build a concise natural-language summary of the user profile for the system prompt */
function buildProfileSummary(profile: UserProfile): string {
  const gender = GENDER_LABELS[profile.gender]?.en ?? profile.gender;
  const conditions = profile.chronicConditions
    .filter(c => c !== "none")
    .map(c => CHRONIC_CONDITION_LABELS[c]?.en ?? c);
  const conditionsStr = conditions.length > 0 ? conditions.join(", ") : "None";
  const meds = profile.currentMedications.trim() || "None";
  const allergies = profile.knownAllergies.trim() || "None";
  const pregnancy = profile.isPregnant ? " (currently pregnant)" : profile.isNursing ? " (currently nursing)" : "";

  return `**USER HEALTH PROFILE (already collected — do NOT re-ask these questions):**
- Age: ${profile.age}
- Gender: ${gender}${pregnancy}
- Chronic conditions: ${conditionsStr}
- Current medications: ${meds}
- Known allergies: ${allergies}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate and extract userProfile — fall back to undefined if shape is invalid
    const rawProfile = body.userProfile;
    const userProfile: UserProfile | undefined =
      rawProfile &&
      typeof rawProfile.age === "number" &&
      rawProfile.age >= 1 &&
      rawProfile.age <= 120 &&
      typeof rawProfile.gender === "string" &&
      Array.isArray(rawProfile.chronicConditions)
        ? (rawProfile as UserProfile)
        : undefined;
    
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

    // Enhanced system instructions with medical intake questionnaire logic
    let systemPrompt = `You are an expert pharmacist and medical image analyzer specialized in providing safe, accurate medical guidance.

**CRITICAL MEDICAL SAFETY PROTOCOL:**
${userProfile
  ? `The user has already completed an onboarding health profile. ${buildProfileSummary(userProfile)}

Use this profile as context for every response. Skip asking for information that has already been provided. Only ask follow-up questions about CURRENT SYMPTOMS and their duration.`
  : `Before providing any medication recommendations or medical advice, you MUST collect the following information from the user:

1. Current symptoms (what, where, intensity)
2. Duration of symptoms (how long)
3. Chronic diseases (diabetes, hypertension, heart disease, kidney disease, liver disease, etc.)
4. Current medications being taken (list all)
5. Known medication allergies
6. Age and gender (critical for dosing and safety)`
}

**Guidelines:**
- Ask these questions conversationally and naturally - not as a rigid form
- If the user has already provided some information, do NOT repeat those questions
- Store and reference provided information throughout the conversation
- After collecting ALL required information, analyze carefully for:
  * Drug-drug interactions
  * Contraindications based on chronic diseases
  * Age-appropriate dosing
  * Allergy risks
  * Pregnancy/nursing considerations (if applicable)

**Response Format:**
- Use bullet points for clarity
- Highlight risks and warnings in bold
- Provide confidence level: **Confidence: High/Medium/Low**
- For Medium/Low confidence: "I recommend consulting a doctor for..."
- Never hallucinate - if unsure, clearly state limitations

**Progressive Interaction:**
- Keep responses concise (avoid overwhelming walls of text)
- After each response, suggest next steps:
  * "Would you like me to check for drug interactions?"
  * "Should I analyze your lab report in detail?"
  * "Do you want to upload a prescription image?"

**For Image Analysis (X-rays, MRIs, CT scans, prescriptions, pills):**
- Analyze thoroughly and describe what you observe
- Provide professional insights based on visible information
- Include a disclaimer: "This is an AI analysis. Always consult with a certified radiologist or medical professional for official diagnosis."
- Do not invent details you cannot see in the image

**Trust & Safety:**
- Always include: "⚠️ This AI does not replace a doctor"
- If risk detected → warn clearly and recommend immediate medical consultation
- For emergencies → advise calling emergency services

For medication questions, use the provided database context if available.`;

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
