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
    
    let errorMessage = "Failed to transcribe audio";
    let statusCode = 500;
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = "Unable to connect to transcription service";
      statusCode = 503;
    } else if (error.status === 429) {
      errorMessage = "Too many transcription requests. Please wait a moment.";
      statusCode = 429;
    } else if (error.message?.includes('file size')) {
      errorMessage = "Audio file is too large. Please record a shorter message.";
      statusCode = 413;
    } else if (error.message?.includes('format')) {
      errorMessage = "Audio format not supported. Please try again.";
      statusCode = 415;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, code: error.code || 'TRANSCRIPTION_ERROR' },
      { status: statusCode }
    );
  }
}
