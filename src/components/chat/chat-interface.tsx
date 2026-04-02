"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Image as ImageIcon, X, Loader2, User, ShieldPlus, Globe, Menu, MessageSquare, Plus, Mic, Square, Volume2, PanelLeft, PanelRight, Activity } from "lucide-react";

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
    subtitle: "Expert Medical Assistant & Rays",
    placeholder: "Ask MedScan",
    disclaimer: "AI can make mistakes. Always consult with a certified medical professional or radiologist.",
    welcome: "Hello! I am your **Smart Medical Assistant**. How can I help you today? 💊👨‍⚕️\n\n*Feel free to ask about medications, or upload a picture of a pill, prescription, X-ray, or CT scan to be analyzed.* 📸🩺",
    you: "You",
    error: "**Error:**",
    serverError: "Sorry, I am having trouble connecting to the server right now. Please try again later.",
    imageAnalysis: "[Medical Image Analysis Request]",
    newChat: "New Chat",
    recentChats: "Recent Chats"
  },
  ar: {
    title: "مساعدك الطبى",
    subtitle: "مساعد طبي وخبير اشعة",
    placeholder: "اسأل ميدسكان",
    disclaimer: "قد يخطئ الذكاء الاصطناعي. استشر طبيبًا معتمدًا أو أخصائي أشعة دائمًا.",
    welcome: "مرحباً! أنا **مساعدك الطبي الذكي**. كيف يمكنني مساعدتك اليوم؟ 💊👨‍⚕️\n\n*لا تتردد في الاستفسار عن الأدوية، أو رفع صورة لقرص دواء، أو وصفة طبية، أو أشعة سينية ومقطعية لتحليلها.* 📸🩺",
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setTypingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

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

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative flex ${
        isSidebarOpen 
          ? "w-72 translate-x-0 !shadow-[0_0_20px_rgba(0,0,0,0.05)] border-" + (lang === 'ar' ? "l" : "r") + " border-slate-200/50" 
          : "w-0 overflow-hidden " + (lang === 'ar' ? "translate-x-full md:translate-x-0 md:border-transparent" : "-translate-x-full md:translate-x-0 md:border-transparent border-none")
      }`}>
         <div className="w-72 bg-slate-50/80 backdrop-blur-xl h-full flex flex-col p-4 gap-6 flex-shrink-0">
            <button 
              onClick={createNewChat}
              className="group flex items-center gap-3 justify-center w-full bg-slate-900 text-white rounded-2xl py-3.5 px-4 font-semibold hover:bg-slate-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98]"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm tracking-tight">{t.newChat}</span>
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 px-3 opacity-70">{t.recentChats}</h3>
               <div className="flex flex-col gap-1.5 px-1">
                 {sessions.sort((a,b) => b.updatedAt - a.updatedAt).map(session => (
                    <button
                      key={session.id}
                      onClick={() => { setCurrentSessionId(session.id); setIsSidebarOpen(false); }}
                      className={`group relative text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-200 ${
                        session.id === currentSessionId 
                          ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/80" 
                          : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                       <MessageSquare size={16} className={`flex-shrink-0 transition-colors ${session.id === currentSessionId ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                  <span className={`truncate text-[13.5px] flex-1 ${session.id === currentSessionId ? "font-semibold text-slate-900" : "font-medium"}`} dir="auto">{session.title}</span>
                  {session.id === currentSessionId && (
                    <div className={`absolute ${lang === 'ar' ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-full`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area Context */}
      <div className="flex flex-col flex-1 min-w-0 h-screen relative transition-all duration-300">
        {/* Sleek Header */}
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-lg border-b border-slate-200/40 px-4 md:px-8 py-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="p-2.5 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-colors flex items-center justify-center hover:scale-[1.05] active:scale-[0.95]"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {lang === "ar" ? <PanelRight size={22} className={!isSidebarOpen ? "" : "text-blue-600"} /> : <PanelLeft size={22} className={!isSidebarOpen ? "" : "text-blue-600"} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-[0_2px_10px_rgba(37,99,235,0.2)] flex-shrink-0 relative group">
                <Activity size={22} className="text-white group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base md:text-[17px] font-bold text-slate-900 tracking-tight leading-none mb-1">{t.title}</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] md:text-xs font-semibold text-blue-600/80 uppercase tracking-wider">{t.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              disabled={isTranslating}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              <Globe size={15} className="text-slate-400" />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-36 pt-4 scroll-smooth">
          <div className="max-w-3xl mx-auto px-4 flex flex-col gap-8">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                id={`message-${msg.id}`}
                className={`flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative mt-1 shadow-sm ${
                    msg.role === "user" 
                      ? "bg-slate-900 border border-slate-800 text-slate-100" 
                      : "bg-gradient-to-br from-blue-600 to-blue-800 border-none text-white shadow-blue-500/20"
                  }`}>
                    {msg.role === "user" ? <User size={16} /> : <Activity size={18} className="text-white" />}
                  </div>

                  {/* Message Box */}
                  <div className="flex flex-col gap-1.5">
                    <div className={`px-4 md:px-5 py-3 rounded-2xl md:rounded-[1.5rem] shadow-sm transition-all duration-300 ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none md:rounded-tr-none hover:bg-blue-700" 
                        : "bg-white border border-slate-100/80 text-slate-700 rounded-tl-none md:rounded-tl-none hover:border-slate-200"
                    }`}>
                      {/* Render uploaded images in history */}
                      {msg.images && msg.images.length > 0 && (
                        <div className={`flex flex-wrap gap-2 mb-3 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.images.map((imgBase64, idx) => (
                            <div key={idx} className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-sm border border-black/5 group-hover:border-black/10 transition-colors">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={imgBase64} 
                                alt={`Uploaded by user ${idx + 1}`} 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={`text-[15px] leading-relaxed break-words font-medium ${msg.role === 'user' ? 'text-blue-50' : 'text-slate-700'}`}>
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
                    
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1 opacity-0 group-hover:opacity-60 transition-opacity duration-300 ${
                      msg.role === "user" ? "text-slate-500 text-right" : "text-slate-400"
                    }`}>
                      {msg.role === "user" ? t.you : t.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Floating Input Area container moved INSIDE flex-1 main chat area  */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent pt-12 pb-6 px-4 pointer-events-none z-10">
          <div className="max-w-3xl mx-auto relative pointer-events-auto">
            
            {/* Multiple Image Thumbnails Preview popup */}
          {attachedImages.length > 0 && (
            <div className="absolute -top-24 left-0 right-0 flex justify-center px-4">
              <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 flex gap-3 max-w-full overflow-x-auto scrollbar-hide animate-in slide-in-from-bottom-4 duration-300">
                {attachedImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden group flex-shrink-0 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeImage(idx);
                      }} 
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Dock */}
          <div className="relative group">
            <form 
              onSubmit={handleSubmit} 
              className="flex items-end gap-2 bg-white ring-1 ring-slate-200/80 shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-[2rem] p-2 pl-4 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:shadow-[0_15px_50px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out"
            >
              <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-full transition-all flex-shrink-0 self-center active:scale-90"
                aria-label="Attach images"
              >
                <ImageIcon size={20} />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                disabled={isLoading || isRecording}
                className={`flex-1 bg-transparent py-4 px-1 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 resize-none max-h-48 scrollbar-hide ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                autoComplete="off"
              />
              
              <div className="flex items-center gap-1.5 pr-1 self-center">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`p-3 rounded-full flex-shrink-0 transition-all duration-300 active:scale-90 ${
                    isRecording
                      ? "bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse"
                      : "text-slate-400 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                  aria-label={isRecording ? "Stop recording" : "Start voice chat"}
                >
                  {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={20} />}
                </button>

                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !isRecording && attachedImages.length === 0) || isLoading}
                  className={`p-3.5 rounded-full flex-shrink-0 transition-all duration-500 shadow-sm ${
                    ((!inputValue.trim() && !isRecording && attachedImages.length === 0) || isLoading)
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
                  }`}
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </form>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col items-center gap-2 mt-4 pointer-events-none">
            {isRecording && (
              <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm border border-red-100 animate-in slide-in-from-bottom-2">
                🎤 Listening...
              </div>
            )}
            
            {isSpeaking && (
              <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm border border-blue-100 animate-in slide-in-from-bottom-2 pointer-events-auto">
                <div className="flex items-center gap-1">
                  <Volume2 size={14} className="animate-bounce" />
                  <span>Speaking...</span>
                </div>
                <button 
                  onClick={stopSpeaking}
                  className="bg-white/80 hover:bg-white text-blue-600 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 active:scale-95"
                >
                  <Square size={10} fill="currentColor" />
                  <span>Stop</span>
                </button>
              </div>
            )}
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.05em] px-6 text-center leading-tight opacity-60">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
