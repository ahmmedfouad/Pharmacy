# MedScan AI

Pharmacy AI is an expert medical assistant and imaging platform powered by Next.js and modern AI models. It allows users to ask medical-related questions, analyze images (e.g., prescriptions, pill photos, X-rays, or CT scans), and chat via voice using natural language.

## Features

- **Expert Chat Interface**: A conversational UI with bilingual (English & Arabic) support, including live chat translation.
- **Medical Image Analysis**: Upload images for AI-assisted insights on prescriptions or scans. Warning: Always consult a professional.
- **Voice Interactivity (STT & TTS)**: Real-time typing animations and voice chat capabilities with realistic synthesized outputs.
- **Premium UI/UX**: A sleek, trustworthy "Medical Blue" aesthetic powered by Tailwind CSS.
- **Specialized AI Agents**: Dedicated agent endpoints designed for focused medical workflows.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- API keys for:
  - [Groq](https://console.groq.com/keys) - For chat and transcription
  - [Gemini](https://aistudio.google.com/app/apikey) - For vision/image analysis
  - [ElevenLabs](https://elevenlabs.io/app/settings/api-keys) - For text-to-speech

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ahmmedfouad/Pharmacy.git
cd Pharmacy
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your API keys:
```bash
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add the environment variables in Vercel project settings:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY`
4. Deploy!

## Recent Updates
- **Premium Medical Blue UI**: Upgraded entire color scheme from emeralds to a deeply trusted, professional blue palette.
- **UI Element Refinement**: Refined shadow drop-offs, ring outlines, and container depths preserving existing design tokens.
- **Voice Chat Integration**: Added ElevenLabs voice chat for natural conversations.

## Disclaimer
*AI can make mistakes. Always consult with a certified medical professional or radiologist.*