import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY." }, { status: 500 });
    }

    // Convert Blob to File format for Groq API
    const buffer = await audioFile.arrayBuffer();
    const audioData = Buffer.from(buffer);

    // Use Groq's Whisper API for transcription
    const transcript = await openai.audio.transcriptions.create({
      file: new File([audioData], "audio.wav", { type: "audio/wav" }),
      model: "whisper-large-v3",
      language: language === "ar" ? "ar" : "en",
    });

    const text = transcript.text || "";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error.message || "Transcription failed" },
      { status: 500 }
    );
  }
}
