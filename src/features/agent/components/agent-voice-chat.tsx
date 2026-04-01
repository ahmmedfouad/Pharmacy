"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, User, Bot, Mic, Square, Volume2 } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "agent";
  content: string;
};

const agentTranslations = {
  en: {
    title: "Agent Voice Chat",
    subtitle: "Talk with the Agent",
    placeholder: "Type or press the mic to speak...",
    disclaimer: "Agent responses are AI-generated. Always verify with professionals.",
    welcome: "Hello! I'm your **Pharmacy Agent**. You can type or use voice to chat with me. How can I help? 🤖",
    listening: "Listening...",
    processing: "Processing voice...",
    speaking: "Speaking...",
    stopRecording: "Stop Recording",
  },
  ar: {
    title: "دردشة الوكيل الصوتية",
    subtitle: "تحدث مع الوكيل",
    placeholder: "اكتب أو اضغط على الميكروفون للتحدث...",
    disclaimer: "استجابات الوكيل من صنع الذكاء الاصطناعي. تحقق دائماً مع المتخصصين.",
    welcome: "مرحباً! أنا **وكيل الصيدلة** الخاص بك. يمكنك الكتابة أو استخدام الصوت للدردشة معي. كيف يمكنني مساعدتك؟ 🤖",
    listening: "استماع جاري...",
    processing: "معالجة الصوت...",
    speaking: "تحدث جاري...",
    stopRecording: "إيقاف التسجيل",
  }
};

function TypingMarkdown({ content, isTyping, onComplete }: { content: string, isTyping: boolean, onComplete: () => void }) {
  const [displayedContent, setDisplayedContent] = useState(isTyping ? "" : content);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedContent(content);
      return;
    }

    let i = 0;
    const charsPerTick = Math.max(1, Math.floor(content.length / 100));
    
    const interval = setInterval(() => {
      i += charsPerTick;
      setDisplayedContent(content.substring(0, i));
      if (i >= content.length) {
        setDisplayedContent(content);
        clearInterval(interval);
        onComplete();
      }
    }, 20);

    return () => clearInterval(interval);
  }, [content, isTyping, onComplete]);

  return (
    <div>
      <ReactMarkdown 
        components={{
          p: ({node, ...props}) => <p className="mb-4 last:mb-0 inline" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-blue-500" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 marker:text-blue-500 font-medium" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {isTyping && <span className="inline-block w-2.5 h-4 bg-blue-500 rounded-sm animate-pulse ml-1 align-middle" />}
    </div>
  );
}

export function AgentVoiceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "agent",
      content: agentTranslations.en.welcome,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [typingId, setTypingId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const t = agentTranslations[language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await sendVoiceMessage(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Please allow microphone access to use voice chat");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", language);

      // Transcribe audio to text
      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error("Transcription failed");

      const transcribeData = await transcribeRes.json();
      const userText = transcribeData.text;

      // Add user message
      const userMessageId = Date.now();
      setMessages(prev => [...prev, {
        id: userMessageId,
        role: "user",
        content: userText,
      }]);

      // Get agent response
      const responseRes = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, language }),
      });

      if (!responseRes.ok) throw new Error("Failed to get response");

      const responseData = await responseRes.json();
      const agentMessageId = Date.now() + 1;
      setTypingId(agentMessageId);

      setMessages(prev => [...prev, {
        id: agentMessageId,
        role: "agent",
        content: responseData.response,
      }]);

      // Speak the response
      await speakResponse(responseData.response);
    } catch (error) {
      console.error("Voice message error:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "agent",
        content: "Sorry, I couldn't process your voice message. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "ar" ? "ar-SA" : "en-US";
      utterance.rate = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setTypingId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setTypingId(null);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, language }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const agentMessageId = Date.now() + 1;
      setTypingId(agentMessageId);

      setMessages(prev => [...prev, {
        id: agentMessageId,
        role: "agent",
        content: data.response,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "agent",
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-500" />
              {t.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            {language === "en" ? "العربية" : "English"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "agent" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-500" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-slate-900 border border-slate-200"
                }`}
              >
                <TypingMarkdown
                  content={msg.content}
                  isTyping={typingId === msg.id}
                  onComplete={() => setTypingId(null)}
                />
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>
              <div className="text-sm text-slate-500 py-2">{t.speaking}</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-slate-500 mb-4 text-center">{t.disclaimer}</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={t.placeholder}
              disabled={isLoading || isRecording}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            
            {/* Voice Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`px-4 py-3 rounded-lg transition flex items-center gap-2 font-medium ${
                isRecording
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-5 h-5" />
                  {t.stopRecording}
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Speak
                </>
              )}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          {isRecording && (
            <div className="mt-3 text-center text-sm text-blue-600 font-medium animate-pulse">
              🎤 {t.listening}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
