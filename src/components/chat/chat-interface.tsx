"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Image as ImageIcon, X, Loader2, User, ShieldPlus, Globe, Menu, MessageSquare, Plus, Mic, Square, Volume2 } from "lucide-react";
import Logo from "@/assets/Logo.png";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
  images?: string[];
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

type Language = "en" | "ar";

// Helper component for Typewriter effect
function TypingMarkdown({ content, isTyping, onComplete }: { content: string, isTyping: boolean, onComplete: () => void }) {
  const [displayedContent, setDisplayedContent] = useState(isTyping ? "" : content);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedContent(content);
      return;
    }

    let i = 0;
    // Speed: add 2-4 chars every 20ms to mimic fast AI typing
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
    <div className={isTyping ? "typing-animation-active" : ""}>
      <ReactMarkdown 
        components={{
          p: ({node, ...props}) => <p className="mb-4 last:mb-0 inline" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-blue-600" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 marker:text-blue-600 font-medium" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-6 mb-3 text-slate-900" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-base font-bold mt-4 mb-2 text-slate-900" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-600 pl-4 italic text-slate-600 bg-slate-50 py-2 my-4 rounded-r-lg" {...props} />
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {isTyping && <span className="inline-block w-2.5 h-4 bg-blue-600 rounded-sm animate-pulse ml-1 align-middle" />}
    </div>
  );
}

const translations = {
  en: {
    title: "MedScan AI",
    subtitle: "Expert Medical Assistant & Imaging",
    placeholder: "Ask about medications, or upload an X-ray/CT scan...",
    disclaimer: "AI can make mistakes. Always consult with a certified medical professional or radiologist.",
    welcome: "Hello! I am your **Pharmacy & Medical AI Assistant**. How can I help you today? 💊\n\n*Feel free to ask about medications, or upload a picture of a pill, prescription, X-ray, or CT scan for me to analyze.*",
    you: "You",
    error: "**Error:**",
    serverError: "Sorry, I am having trouble connecting to the server right now. Please try again later.",
    imageAnalysis: "[Medical Image Analysis Request]",
    newChat: "New Chat",
    recentChats: "Recent Chats"
  },
  ar: {
    title: "مساعدك الطبى",
    subtitle: "مساعد طبي وخبير تصوير",
    placeholder: "اسأل عن الأدوية، أو ارفع صورة أشعة/مقطعية...",
    disclaimer: "قد يخطئ الذكاء الاصطناعي. استشر طبيبًا معتمدًا أو أخصائي أشعة دائمًا.",
    welcome: "مرحباً! أنا **المساعد الصيدلي والطبي الذكي**. كيف يمكنني مساعدتك اليوم؟ 💊\n\n*لا تتردد في السؤال عن الأدوية، أو رفع صورة لحبة دواء، وصفة طبية، أو أشعة سينية ومقطعية لأقوم بتحليلها.*",
    you: "أنت",
    error: "**خطأ:**",
    serverError: "عذراً، أواجه مشكلة في الاتصال بالخادم الآن. يرجى المحاولة مرة أخرى لاحقاً.",
    imageAnalysis: "[طلب تحليل صورة طبية]",
    newChat: "محادثة جديدة",
    recentChats: "المحادثات الأخيرة"
  }
};

export function ChatInterface() {
  const [lang, setLang] = useState<Language>("en");
  const t = translations[lang];

  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "default",
      title: t.newChat,
      messages: [{ id: 1, role: "ai", content: t.welcome }],
      updatedAt: Date.now()
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("default");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession.messages;

  const setMessages = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    setSessions(prevSessions => prevSessions.map(session => {
      if (session.id === currentSessionId) {
        const newMessages = typeof updater === "function" ? updater(session.messages) : updater;
        
        let newTitle = session.title;
        if (session.messages.length === 1 && newMessages.length > 1) {
          const userMsg = newMessages.find(m => m.role === "user");
          if (userMsg && userMsg.content && userMsg.content !== t.imageAnalysis && userMsg.content !== translations.ar.imageAnalysis && userMsg.content !== translations.en.imageAnalysis) {
            newTitle = userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? "..." : "");
          } else if (userMsg && (userMsg.images || userMsg.content === t.imageAnalysis || userMsg.content === translations.ar.imageAnalysis || userMsg.content === translations.en.imageAnalysis)) {
            newTitle = t.imageAnalysis;
          }
        }
        
        return { ...session, messages: newMessages, updatedAt: Date.now(), title: newTitle };
      }
      return session;
    }));
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    setSessions(prev => [
      { id: newId, title: t.newChat, messages: [{ id: 1, role: "ai", content: t.welcome }], updatedAt: Date.now() },
      ...prev
    ]);
    setCurrentSessionId(newId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const [isTranslating, setIsTranslating] = useState(false);

  // Update welcome messages dynamically for untouched chats if language changes
  useEffect(() => {
    setSessions(prevSessions => prevSessions.map(session => {
      if (session.messages.length === 1 && session.messages[0].id === 1) {
        return { ...session, title: t.newChat, messages: [{ id: 1, role: "ai", content: t.welcome }] };
      }
      return session;
    }));
  }, [lang, t.welcome, t.newChat]);

  // Translate existing chat history when language toggles
  const toggleLanguage = async () => {
    const nextLang = lang === "en" ? "ar" : "en";
    setLang(nextLang);

    // If there's actual history (more than the welcome message)
    if (messages.length > 1) {
      setIsTranslating(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: messages.filter(m => m.id !== 1), // Don't send welcome message, we handled it
            targetLanguage: nextLang 
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Update the message array with translated text, keeping IDs and images intact
          setMessages([
            { id: 1, role: "ai", content: translations[nextLang].welcome },
            ...data.translatedMessages
          ]);
        }
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setIsTranslating(false);
      }
    }
  };
  const [inputValue, setInputValue] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingId, setTypingId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

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
      formData.append("language", lang);

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error("Transcription failed");

      const transcribeData = await transcribeRes.json();
      const userText = transcribeData.text;

      const userMsg: Message = { 
        id: Date.now(), 
        role: "user", 
        content: userText
      };
      
      const newMessagesList = [...messages, userMsg];
      setMessages(newMessagesList);
      
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: newMessagesList,
            language: lang 
          }),
        });

        const data = await res.json();
        const aiResponseId = Date.now();
        
        if (res.ok) {
          const aiMsg = { id: aiResponseId, role: "ai" as const, content: data.response };
          setMessages((prev) => [...prev, aiMsg]);
          setTypingId(aiResponseId);
          
          await speakResponse(data.response);
        } else {
          setMessages((prev) => [
            ...prev, 
            { id: aiResponseId, role: "ai", content: `${t.error} ${data.error || "Failed to get response"}` }
          ]);
        }
      } catch (error) {
        console.error(error);
        setMessages((prev) => [
          ...prev, 
          { id: Date.now(), role: "ai", content: t.serverError }
        ]);
      }
    } catch (error) {
      console.error("Voice message error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now(),
        role: "ai",
        content: "Sorry, I couldn't process your voice message. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);

      // Stop previous audio if playing
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }

      // Try fetching high-quality TTS from ElevenLabs API
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("ElevenLabs TTS failed:", errData);
        throw new Error(`High quality TTS failed: ${errData.error || res.status}`);
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setTypingId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setTypingId(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error(error);
      
      // Fallback to browser's native robotic voice
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
      utterance.rate = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setTypingId(null);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setTypingId(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Convert all selected files to base64
    const promises = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const base64Results = await Promise.all(promises);
    setAttachedImages((prev) => [...prev, ...base64Results]);
    setTimeout(scrollToBottom, 100);
    
    // Clear input so same files can be selected again
    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setAttachedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && attachedImages.length === 0) || isLoading) return;

    const newMsg: Message = { 
      id: Date.now(), 
      role: "user", 
      content: inputValue || (attachedImages.length > 0 ? t.imageAnalysis : ""),
      images: attachedImages.length > 0 ? [...attachedImages] : undefined
    };
    
    const newMessagesList = [...messages, newMsg];
    setMessages(newMessagesList);
    
    setInputValue("");
    setAttachedImages([]);
    setIsLoading(true);
    setTimeout(scrollToBottom, 100);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessagesList,
          language: lang 
        }),
      });

      const data = await res.json();
      const aiResponseId = Date.now();
      
      if (res.ok) {
        setMessages((prev) => [
          ...prev, 
          { id: aiResponseId, role: "ai", content: data.response }
        ]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { id: aiResponseId, role: "ai", content: `${t.error} ${data.error || "Failed to get response"}` }
        ]);
      }

      setTypingId(aiResponseId);

      // Scroll to the start of the newly added ai message container rather than dropping to the very bottom
      setTimeout(() => {
        const el = document.getElementById(`message-${aiResponseId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now(), role: "ai", content: t.serverError }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-800" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-30 w-72 bg-slate-50 border-${lang === 'ar' ? 'l' : 'r'} border-slate-200/60 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isSidebarOpen 
          ? "translate-x-0" 
          : (lang === 'ar' ? "translate-x-full" : "-translate-x-full")
      }`}>
         <div className="p-4 h-full flex flex-col gap-4">
            <button 
              onClick={createNewChat}
              className="flex items-center gap-2 justify-center w-full bg-blue-600 text-white rounded-xl py-3 px-4 font-semibold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
            >
              <Plus size={20} />
              <span>{t.newChat}</span>
            </button>

            <div className="flex-1 overflow-y-auto mt-2">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{t.recentChats}</h3>
               <div className="flex flex-col gap-1">
                 {sessions.sort((a,b) => b.updatedAt - a.updatedAt).map(session => (
                    <button
                      key={session.id}
                      onClick={() => { setCurrentSessionId(session.id); setIsSidebarOpen(false); }}
                      className={`text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                        session.id === currentSessionId 
                          ? "bg-white shadow-sm ring-1 ring-slate-200" 
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                       <MessageSquare size={18} className={`flex-shrink-0 ${session.id === currentSessionId ? "text-blue-600" : "text-slate-400"}`} />
                       <span className={`truncate text-sm flex-1 ${session.id === currentSessionId ? "font-semibold text-blue-900" : "font-medium"}`} dir="auto">{session.title}</span>
                    </button>
                 ))}
               </div>
            </div>
         </div>
      </div>

      {/* Main Chat Area Context */}
      <div className="flex flex-col flex-1 min-w-0 h-screen relative transition-all duration-300">
        {/* Sleek Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100/80 px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              className="p-2 -ml-2 mr-1 text-slate-500 hover:bg-slate-100 rounded-full md:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
              <img src={Logo.src} alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900 leading-tight">{t.title}</h1>
              <p className="text-[10px] md:text-xs font-medium text-blue-700 hidden xs:block">{t.subtitle}</p>
            </div>
          </div>
          
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            disabled={isTranslating}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-full border border-slate-200/60 hover:bg-slate-50 transition-colors text-xs md:text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 flex-shrink-0"
          >
            <Globe size={16} />
            <span>{lang === "en" ? "العربية" : "EN"}</span>
          </button>
        </header>

        {/* Main Chat Area (ChatGPT style center column) */}
      <div className="flex-1 overflow-y-auto pb-36 pt-4 scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 flex flex-col gap-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              id={`message-${msg.id}`}
              className={`flex gap-4 p-4 md:p-6 rounded-3xl transition-all ${
                msg.role === "ai" ? "bg-slate-50 border border-slate-100/80 shadow-sm" : ""
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" 
                  ? "bg-slate-200 text-slate-600" 
                  : "bg-white shadow-sm ring-2 ring-white overflow-hidden"
              }`}>
                {msg.role === "user" ? <User size={18} /> : <img src={Logo.src} alt="AI" className="w-full h-full object-cover scale-[1.35]" />}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm mb-1">
                  {msg.role === "user" ? t.you : t.title}
                </div>
                
                {/* Render uploaded images in history */}
                {msg.images && msg.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3 mt-2">
                    {msg.images.map((imgBase64, idx) => (
                      <div key={idx} className="relative w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-sm border border-slate-200/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={imgBase64} 
                          alt={`Uploaded by user ${idx + 1}`} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-slate-700 text-[15px] leading-relaxed break-words w-full">
                  {msg.role === "ai" ? (
                    <TypingMarkdown 
                      content={msg.content} 
                      isTyping={typingId === msg.id}
                      onComplete={() => setTypingId(null)}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-10 pb-6 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto relative pointer-events-auto">
          
          {/* Multiple Image Thumbnails Preview popup */}
          {attachedImages.length > 0 && (
            <div className="absolute -top-24 left-4 bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg ring-1 ring-slate-200 animate-in fade-in slide-in-from-bottom-2 flex gap-2 max-w-[calc(100%-2rem)] overflow-x-auto scrollbar-hide">
              {attachedImages.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden group flex-shrink-0 border border-slate-200/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeImage(idx);
                      }} 
                      className="text-white hover:text-red-400 p-1" 
                      aria-label="Remove image"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Dock */}
          <form 
            onSubmit={handleSubmit} 
            className="flex items-end gap-2 bg-white ring-1 ring-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] shadow-blue-900/5 rounded-[2rem] p-2 pl-4 focus-within:ring-2 focus-within:ring-blue-600 focus-within:shadow-md transition-all duration-300"
          >
            <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0 self-center"
              aria-label="Attach images"
            >
              <ImageIcon size={22} />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.placeholder}
              disabled={isLoading || isRecording}
              className={`flex-1 bg-transparent py-4 mx-2 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              autoComplete="off"
            />
            
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`p-3 rounded-full flex-shrink-0 self-center transition-colors ${
                isRecording
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "text-slate-400 hover:text-blue-700 hover:bg-blue-50"
              }`}
              aria-label={isRecording ? "Stop recording" : "Start voice chat"}
            >
              {isRecording ? <Square size={20} /> : <Mic size={22} />}
            </button>

            <button
              type="submit"
              disabled={(!inputValue.trim() && !isRecording && attachedImages.length === 0) || isLoading}
              className={`p-3 md:p-4 rounded-full flex-shrink-0 self-center transition-all duration-300 ${
                ((!inputValue.trim() && !isRecording && attachedImages.length === 0) || isLoading)
                  ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95"
              }`}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={lang === "ar" ? "mr-0.5 rotate-360" : "ml-0.5"} />}
            </button>
          </form>
          {isRecording && (
            <div className="text-center mt-3 text-sm text-red-600 font-medium animate-pulse">
              🎤 Listening...
            </div>
          )}
          {isSpeaking && (
            <div className="text-center mt-3 text-sm text-blue-700 font-medium animate-pulse">
              <Volume2 size={16} className="inline mr-1" /> Speaking...
            </div>
          )}
          <div className="text-center mt-3 text-xs text-slate-400 font-medium">
            {t.disclaimer}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
