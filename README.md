# MedScan AI

MedScan AI is an expert medical assistant and imaging platform powered by Next.js and modern AI models. It allows users to ask medical-related questions, analyze images (e.g., prescriptions, pill photos, X-rays, or CT scans), and chat via voice using natural language.

## Features

- **Expert Chat Interface**: A conversational UI with bilingual (English & Arabic) support, including live chat translation.
- **Medical Image Analysis**: Upload images for AI-assisted insights on prescriptions or scans. *Warning: Always consult a professional.*
- **Voice Interactivity (STT & TTS)**: Real-time typing animations and voice chat capabilities with realistic synthesized outputs.
- **Premium UI/UX**: A sleek, trustworthy "Medical Blue" aesthetic powered by Tailwind CSS.
- **Specialized AI Agents**: Dedicated agent endpoints designed for focused medical workflows.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Deployment

This is a [Next.js](https://nextjs.org/) project. To deploy, ensure the following environment variables are set:
- `GROQ_API_KEY`: For chat and transcription.
- `GEMINI_API_KEY`: For image analysis.
- `ELEVENLABS_API_KEY`: For text-to-speech.

## Recent Updates
- **Premium Medical Blue UI**: Upgraded entire color scheme from emeralds to a deeply trusted, professional blue palette.
- **UI Element Refinement**: Refined shadow drop-offs, ring outlines, and container depths preserving existing design tokens.

## Disclaimer
*AI can make mistakes. Always consult with a certified medical professional or radiologist.*
