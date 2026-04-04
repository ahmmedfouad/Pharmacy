"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Image as ImageIcon, X, Loader2, User, Globe, Menu, MessageSquare, Plus, Mic, Square, Volume2, FileText, Scan, Pill, Settings } from "lucide-react";
import Logo from "@/assets/Logo.png";
import type { UserProfile } from "@/types/user-profile";
import { GENDER_LABELS, CHRONIC_CONDITION_LABELS } from "@/types/user-profile";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

const USER_PROFILE_STORAGE_KEY = "medscan_user_profile";

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
    subtitle: "Analyze prescriptions, X-rays, and medical reports instantly",
    placeholder: "Describe your symptoms or upload a medical file...",
    disclaimer: "⚠️ This AI does not replace a doctor. Always consult a certified medical professional for diagnosis and treatment.",
    welcome: "Hello! I am your **Pharmacy & Medical AI Assistant**. How can I help you today? 💊\n\n*Feel free to ask about medications, or upload a picture of a pill, prescription, X-ray, or CT scan for me to analyze.*",
    you: "You",
    error: "**Error:**",
    serverError: "Sorry, I am having trouble connecting to the server right now. Please try again later.",
    imageAnalysis: "[Medical Image Analysis Request]",
    newChat: "New Chat",
    recentChats: "Recent Chats",
    quickActions: {
      uploadPrescription: "Upload Prescription",
      analyzeXray: "Analyze X-ray / CT",
      identifyMedication: "Identify Medication"
    },
    examplePrompts: [
      "What is this medicine used for?",
      "Analyze this lab report",
      "Are these medications safe together?"
    ],
    emptyStateTitle: "How can I help you today?",
    emptyStateSubtitle: "Try one of these common requests:"
  },
  ar: {
    title: "مساعدك الطبى",
    subtitle: "تحليل الوصفات الطبية والأشعة والتقارير الطبية فوراً",
    placeholder: "صف أعراضك أو ارفع ملف طبي...",
    disclaimer: "⚠️ هذا الذكاء الاصطناعي لا يحل محل الطبيب. استشر دائماً طبيباً معتمداً للتشخيص والعلاج.",
    welcome: "مرحباً! أنا **المساعد الصيدلي والطبي الذكي**. كيف يمكنني مساعدتك اليوم؟ 💊\n\n*لا تتردد في السؤال عن الأدوية، أو رفع صورة لحبة دواء، وصفة طبية، أو أشعة سينية ومقطعية لأقوم بتحليلها.*",
    you: "أنت",
    error: "**خطأ:**",
    serverError: "عذراً، أواجه مشكلة في الاتصال بالخادم الآن. يرجى المحاولة مرة أخرى لاحقاً.",
    imageAnalysis: "[طلب تحليل صورة طبية]",
    newChat: "محادثة جديدة",
    recentChats: "المحادثات الأخيرة",
    quickActions: {
      uploadPrescription: "رفع وصفة طبية",
      analyzeXray: "تحليل أشعة / مقطعية",
      identifyMedication: "تحديد دواء"
    },
    examplePrompts: [
      "ما هو استخدام هذا الدواء؟",
      "حلل هذا التقرير المخبري",
      "هل هذه الأدوية آمنة معاً؟"
    ],
    emptyStateTitle: "كيف يمكنني مساعدتك اليوم؟",
    emptyStateSubtitle: "جرب أحد هذه الطلبات الشائعة:"
  }
};

export function ChatInterface() {
  const [lang, setLang] = useState<Language>("en");
  const t = translations[lang];

  // User profile — loaded from localStorage on mount
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (stored) {
        setUserProfile(JSON.parse(stored) as UserProfile);
      } else {
        setShowOnboarding(true);
      }
    } catch {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowOnboarding(false);
    try {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // storage not available — continue without persistence
    }
  };

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
            // Generate meaningful title based on intent, not just first words
            newTitle = generateChatTitle(userMsg.content);
          } else if (userMsg && (userMsg.images || userMsg.content === t.imageAnalysis || userMsg.content === translations.ar.imageAnalysis || userMsg.content === translations.en.imageAnalysis)) {
            newTitle = lang === "ar" ? "تحليل صورة طبية" : "Medical Image Analysis";
          }
        }

        return { ...session, messages: newMessages, updatedAt: Date.now(), title: newTitle };
      }
      return session;
    }));
  };

  const generateChatTitle = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Pattern matching for common medical intents
    if (msg.includes("headache") || msg.includes("fever") || msg.includes("pain")) {
      return lang === "ar" ? "تقييم أعراض" : "Symptom Assessment";
    }
    if (msg.includes("prescription") || msg.includes("analyze") && msg.includes("prescription")) {
      return lang === "ar" ? "مراجعة وصفة طبية" : "Prescription Review";
    }
    if (msg.includes("safe") && (msg.includes("together") || msg.includes("with"))) {
      return lang === "ar" ? "فحص التفاعلات الدوائية" : "Drug Interaction Check";
    }
    if (msg.includes("side effect") || msg.includes("adverse")) {
      return lang === "ar" ? "الآثار الجانبية" : "Side Effects Query";
    }
    if (msg.includes("dose") || msg.includes("dosage") || msg.includes("how much")) {
      return lang === "ar" ? "استفسار الجرعة" : "Dosage Inquiry";
    }
    if (msg.includes("allerg")) {
      return lang === "ar" ? "استشارة حساسية" : "Allergy Consultation";
    }
    if (msg.includes("x-ray") || msg.includes("ct") || msg.includes("mri") || msg.includes("scan")) {
      return lang === "ar" ? "تحليل صورة أشعة" : "Medical Imaging Review";
    }
    if (msg.includes("lab") || msg.includes("test result") || msg.includes("blood")) {
      return lang === "ar" ? "تحليل نتائج مخبرية" : "Lab Results Analysis";
    }
    if (msg.includes("pregnant") || msg.includes("pregnancy")) {
      return lang === "ar" ? "استشارة الحمل" : "Pregnancy Consultation";
    }
    if (msg.includes("child") || msg.includes("baby") || msg.includes("infant")) {
      return lang === "ar" ? "استشارة طب الأطفال" : "Pediatric Consultation";
    }

    // Default: use first meaningful words (max 5 words)
    const words = userMessage.trim().split(/\s+/).slice(0, 5).join(' ');
    return words.length > 30 ? words.substring(0, 30) + "..." : words;
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
            language: lang,
            userProfile
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
          language: lang,
          userProfile
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

  const handleQuickAction = (actionType: 'prescription' | 'xray' | 'medication') => {
    fileInputRef.current?.click();
  };

  const handleExamplePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-800" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Interactive Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard lang={lang} onComplete={handleOnboardingComplete} />
      )}

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

            {/* User Profile Summary in Sidebar */}
            {userProfile && (
              <div className="mt-auto pt-4 border-t border-slate-200">
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-blue-700 flex items-center gap-1">
                    <User size={12} /> {lang === "ar" ? "ملفك الصحي" : "Your Health Profile"}
                  </p>
                  <p>{lang === "ar" ? "العمر:" : "Age:"} <span className="font-medium">{userProfile.age}</span></p>
                  <p>{lang === "ar" ? "الجنس:" : "Gender:"} <span className="font-medium">{GENDER_LABELS[userProfile.gender][lang]}</span></p>
                  {userProfile.chronicConditions.filter(c => c !== "none").length > 0 && (
                    <p className="truncate">{lang === "ar" ? "أمراض مزمنة:" : "Conditions:"} <span className="font-medium">{userProfile.chronicConditions.filter(c => c !== "none").map(c => CHRONIC_CONDITION_LABELS[c][lang]).join(", ")}</span></p>
                  )}
                </div>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="mt-2 w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-blue-600 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Settings size={13} />
                  {lang === "ar" ? "تعديل الملف الصحي" : "Edit Health Profile"}
                </button>
              </div>
            )}
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
          {/* Empty State: Quick Actions & Example Prompts */}
          {messages.length === 1 && messages[0].id === 1 && (
            <div className="mt-8 md:mt-16 flex flex-col items-center gap-8">
              {/* Hero Section */}
              <div className="text-center space-y-3 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  {t.emptyStateTitle}
                </h2>
                <p className="text-base md:text-lg text-slate-600 font-medium">
                  {t.subtitle}
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                <button
                  onClick={() => handleQuickAction('prescription')}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <FileText size={28} className="text-blue-600" />
                  </div>
                  <span className="font-semibold text-sm text-slate-800 text-center">
                    {t.quickActions.uploadPrescription}
                  </span>
                </button>

                <button
                  onClick={() => handleQuickAction('xray')}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <Scan size={28} className="text-blue-600" />
                  </div>
                  <span className="font-semibold text-sm text-slate-800 text-center">
                    {t.quickActions.analyzeXray}
                  </span>
                </button>

                <button
                  onClick={() => handleQuickAction('medication')}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <Pill size={28} className="text-blue-600" />
                  </div>
                  <span className="font-semibold text-sm text-slate-800 text-center">
                    {t.quickActions.identifyMedication}
                  </span>
                </button>
              </div>

              {/* Example Prompts */}
              <div className="w-full max-w-2xl space-y-3">
                <p className="text-sm font-semibold text-slate-500 text-center">
                  {t.emptyStateSubtitle}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {t.examplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExamplePromptClick(prompt)}
                      className="text-left px-5 py-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all text-sm text-slate-700 font-medium hover:shadow-md"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Indicator / Warning Banner */}
              <div className="max-w-2xl w-full mt-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                  <div className="text-amber-600 flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-amber-900 font-medium">
                      {t.disclaimer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
        </div>
      </div>
    </div>
    </div>
  );
}
