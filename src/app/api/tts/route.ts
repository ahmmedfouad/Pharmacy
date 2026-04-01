import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY." }, { status: 500 });
    }

    // Default ElevenLabs Voices: 
    // Adam (deep, male) - pNInz6obpgDQGcFmaJgB
    // We will use Adam since he sounds professional and works well with multilingual for Arabic/English.
    const voiceId = "pNInz6obpgDQGcFmaJgB";

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2", // Multilingual v2 supports English and Arabic
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ElevenLabs Error details:", errorData);
      
      // Send the strict error back so we don't silently fallback without knowing
      return NextResponse.json({ error: `ElevenLabs Error: ${errorData}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    const errorMessage = error instanceof Error ? error.message : "TTS failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
