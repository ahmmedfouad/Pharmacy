"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Image as ImageIcon, X, Loader2, User, Globe, MessageSquare, Plus, Mic, Square, Volume2, PanelLeft, PanelRight, Activity, AlertTriangle, Sparkles } from "lucide-react";

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

type OnboardingAlert = {
  title: string;
  message: string;
  tone: "error" | "info";
};

// Helper component for Typewriter effect
function TypingMarkdown({ content, isTyping, onComplete }: { content: string, isTyping: boolean, onComplete: () => void }) {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    if (!isTyping) {
      return;
    }

    let i = 0;
    const resetTimeout = window.setTimeout(() => setDisplayedContent(""), 0);
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

    return () => {
      clearTimeout(resetTimeout);
      clearInterval(interval);
    };
  }, [content, isTyping, onComplete]);

  const markdownContent = isTyping ? displayedContent : content;

  return (
    <div className={isTyping ? "typing-animation-active" : ""}>
      <ReactMarkdown 
        components={{
          p: ({node, ...props}) => <p className="mb-4 leading-relaxed tracking-wide text-[15.5px] last:mb-0 inline-block w-full" {...props} />,
          ul: ({node, ...props}) => <ul className="pl-1 mb-5 space-y-3" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-5 space-y-3 font-semibold text-slate-800" {...props} />,
          li: ({node, ...props}) => (
            <li className="flex items-start gap-2.5">
              <span className="text-blue-500 shrink-0 mt-0.5 text-[15px] leading-none">⚕️</span>
              <span className="flex-1 font-medium text-slate-700 leading-relaxed" {...props} />
            </li>
          ),
          strong: ({node, ...props}) => <strong className="font-bold text-slate-900 bg-blue-50/70 px-1.5 py-0.5 rounded-md border border-blue-100/50 shadow-sm inline-block" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-[17px] font-bold mt-7 mb-3 text-slate-900 flex items-center gap-2 before:content-['🏥']" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-[15.5px] font-bold mt-5 mb-2 text-slate-800 flex items-center gap-2 before:content-['✨']" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 font-semibold hover:underline underline-offset-4 decoration-blue-300 break-all" target="_blank" rel="noopener noreferrer" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent pl-4 py-3 my-5 rounded-r-xl italic text-slate-700 font-medium" {...props} />
        }}
      >
        {markdownContent}
      </ReactMarkdown>
      {isTyping && <span className="inline-block w-2.5 h-4 bg-blue-600 rounded-sm animate-pulse ml-1 align-middle" />}
    </div>
  );
}

const translations = {
  en: {
    title: "MedScan",
    subtitle: "AI-Powered Healthcare Platform",
    placeholder: "Ask MedScan",
    disclaimer: "AI-powered assistant. Always consult qualified healthcare professionals for medical decisions.",
    welcome: "Hello! I'm your AI Medical Assistant.\n\nTo provide safe and accurate guidance, I’ll ask you a few quick questions first.\n\nWhat is your age?",
    agePrompt: "What is your age?",
    onboardingQuestions: [
      "What is your gender?",
      "Do you have any chronic conditions?",
      "Are you currently taking any medications?"
    ],
    onboardingCardTitle: "Quick onboarding",
    onboardingCardSubtitle: "Answer these short questions so MedScan can respond more safely and personally.",
    onboardingQuestionLabel: "Current question",
    onboardingProgressLabel: "Step",
    ageInputPlaceholder: "Enter your age (1-116)",
    ageHelper: "Only ages from 1 to 116 years are accepted.",
    ageAlertTitle: "Invalid age",
    ageAlertMessage: "Please enter one valid age between 1 and 116 years.",
    onboardingAttachmentTitle: "Finish onboarding first",
    onboardingAttachmentMessage: "Complete the quick questions before uploading medical images.",
    quickRepliesLabel: "Quick answers",
    male: "Male",
    female: "Female",
    none: "None",
    yes: "Yes",
    diabetes: "Diabetes",
    hypertension: "Hypertension",
    asthma: "Asthma",
    you: "You",
    error: "**Error:**",
    serverError: "Unable to connect to the server. Please check your internet connection and try again.",
    networkError: "Network error. Please check your connection.",
    voiceError: "Could not process voice message. Please try again.",
    micError: "Microphone access denied. Please allow microphone access in your browser settings.",
    transcriptionError: "Failed to transcribe audio. Please try speaking again.",
    ttsError: "Text-to-speech unavailable. Using fallback voice.",
    translating: "Translating...",
    translationError: "Translation Error",
    translationErrorMessage: "Could not translate messages. Please try again.",
    imageAnalysis: "[Medical Image Analysis Request]",
    newChat: "New Chat",
    recentChats: "Recent Chats"
  },
  ar: {
    title: "ميدسكان",
    subtitle: "منصة رعاية صحية بالذكاء الاصطناعي",
    placeholder: "اسأل ميدسكان",
    disclaimer: "مساعد يعمل بالذكاء الاصطناعي. استشر دائماً متخصصي الرعاية الصحية المؤهلين للقرارات الطبية.",
    welcome: "مرحباً! أنا مساعدك الطبي بالذكاء الاصطناعي.\n\nلتقديم إرشادات آمنة ودقيقة، سأطرح عليك بضعة أسئلة سريعة أولاً.\n\nما هو عمرك؟",
    agePrompt: "ما هو عمرك؟",
    onboardingQuestions: [
      "ما هو جنسك؟",
      "هل تعاني من أي أمراض مزمنة؟",
      "هل تتناول أي أدوية حالياً؟"
    ],
    onboardingCardTitle: "تهيئة سريعة",
    onboardingCardSubtitle: "أجب عن هذه الأسئلة القصيرة ليقدم ميدسكان استجابة أكثر أماناً وملاءمة.",
    onboardingQuestionLabel: "السؤال الحالي",
    onboardingProgressLabel: "الخطوة",
    ageInputPlaceholder: "أدخل عمرك (1-116)",
    ageHelper: "يتم قبول الأعمار من 1 إلى 116 سنة فقط.",
    ageAlertTitle: "عمر غير صالح",
    ageAlertMessage: "يرجى إدخال عمر صحيح واحد بين 1 و116 سنة.",
    onboardingAttachmentTitle: "أكمل التهيئة أولاً",
    onboardingAttachmentMessage: "أكمل الأسئلة السريعة قبل رفع الصور الطبية.",
    quickRepliesLabel: "إجابات سريعة",
    male: "ذكر",
    female: "أنثى",
    none: "لا يوجد",
    yes: "نعم",
    diabetes: "السكري",
    hypertension: "ارتفاع الضغط",
    asthma: "الربو",
    you: "أنت",
    error: "**خطأ:**",
    serverError: "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.",
    networkError: "خطأ في الشبكة. يرجى التحقق من اتصالك.",
    voiceError: "تعذر معالجة الرسالة الصوتية. يرجى المحاولة مرة أخرى.",
    micError: "تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح.",
    transcriptionError: "فشل تحويل الصوت إلى نص. يرجى التحدث مرة أخرى.",
    ttsError: "تحويل النص إلى كلام غير متاح. استخدام الصوت الاحتياطي.",
    translating: "جاري الترجمة...",
    translationError: "خطأ في الترجمة",
    translationErrorMessage: "تعذر ترجمة الرسائل. يرجى المحاولة مرة أخرى.",
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
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingAlert, setOnboardingAlert] = useState<OnboardingAlert | null>(null);

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
        const isDefaultTitle = newTitle === t.newChat || newTitle === translations.en.newChat || newTitle === translations.ar.newChat || newTitle === translations.en.imageAnalysis || newTitle === translations.ar.imageAnalysis;

        if (isDefaultTitle) {
          const userMsgs = newMessages.filter(m => m.role === "user");
          const hasImages = userMsgs.some(m => m.images && m.images.length > 0);

          if (hasImages) {
            newTitle = t.imageAnalysis;
          } else if (userMsgs.length >= 4) { 
            // Avoid naming chat after first initial onboarding prompt (e.g. "Age", "Gender")
            // Instead name it based on the first major content message length (or symptom description)
            const targetMsg = userMsgs.length > 4 ? userMsgs[4] : userMsgs[userMsgs.length - 1];
            if (targetMsg && targetMsg.content && targetMsg.content.length > 2) {
              newTitle = targetMsg.content.slice(0, 30) + (targetMsg.content.length > 30 ? "..." : "");
            }
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
    setOnboardingStep(0);
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
    const currentLang = lang;
    setLang(nextLang);

    if (messages.length > 1) {
      setIsTranslating(true);
      try {
        const enT = translations.en;
        const arT = translations.ar;
        const messagesToTranslate: (Message & { originalIndex: number })[] = [];
        const newMessages = [...messages];

        // First pass: Handle static translations (welcome, questions, etc.)
        newMessages.forEach((m, idx) => {
          if (m.content === enT.welcome || m.content === arT.welcome) {
            newMessages[idx] = { ...m, content: translations[nextLang].welcome };
          } else if (m.content === enT.agePrompt || m.content === arT.agePrompt) {
            newMessages[idx] = { ...m, content: translations[nextLang].agePrompt };
          } else if (enT.onboardingQuestions.includes(m.content)) {
            const qIdx = enT.onboardingQuestions.indexOf(m.content);
            newMessages[idx] = { ...m, content: translations[nextLang].onboardingQuestions[qIdx] };
          } else if (arT.onboardingQuestions.includes(m.content)) {
            const qIdx = arT.onboardingQuestions.indexOf(m.content);
            newMessages[idx] = { ...m, content: translations[nextLang].onboardingQuestions[qIdx] };
          } else if (m.content === enT.imageAnalysis || m.content === arT.imageAnalysis) {
            newMessages[idx] = { ...m, content: translations[nextLang].imageAnalysis };
          } else if (m.content.startsWith(enT.error.replace('**', '').replace(':', '').trim()) || m.content.startsWith(arT.error.replace('**', '').replace(':', '').trim())) {
             // Handle error messages with markdown
             const errorPrefixEn = enT.error;
             const errorPrefixAr = arT.error;
             let errorContent = m.content;
             if (m.content.includes(errorPrefixEn)) errorContent = m.content.replace(errorPrefixEn, '').trim();
             else if (m.content.includes(errorPrefixAr)) errorContent = m.content.replace(errorPrefixAr, '').trim();
             
             newMessages[idx] = { ...m, content: `${translations[nextLang].error} ${errorContent}` };
          } else {
            // For custom user and AI response messages, queue for API translation
            messagesToTranslate.push({ ...m, originalIndex: idx });
          }
        });

        // Second pass: Translate custom messages via API if any exist
        if (messagesToTranslate.length > 0) {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              messages: messagesToTranslate.map(m => ({ 
                role: m.role, 
                content: m.content 
              })),
              targetLanguage: nextLang 
            }),
          });

          if (res.ok) {
            const data = await res.json();
            
            // Validate response
            if (data.translatedMessages && Array.isArray(data.translatedMessages)) {
              // Map the API translated text back to exact original positions
              data.translatedMessages.forEach((tm: any, i: number) => {
                if (i < messagesToTranslate.length) {
                  const originalIdx = messagesToTranslate[i].originalIndex;
                  if (tm.content) {
                    newMessages[originalIdx] = { 
                      ...newMessages[originalIdx], 
                      content: tm.content 
                    };
                  }
                }
              });
            } else {
              console.warn("Translation API returned unexpected format, keeping original messages");
            }
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error("Translation API error:", errorData);
            // Keep original messages on error
          }
        }
        
        // Update messages only if we have valid translations
        setMessages(() => newMessages);
        
      } catch (error) {
        console.error("Translation failed:", error);
        // Revert language change on error
        setLang(currentLang);
        // Show error notification to user
        setOnboardingAlert({
          title: translations[currentLang].translationError,
          message: translations[currentLang].translationErrorMessage,
          tone: "error"
        });
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

  const isOnboardingActive = onboardingStep < 4;
  const isAgeStep = onboardingStep === 0;
  const currentOnboardingQuestion = isAgeStep ? t.agePrompt : t.onboardingQuestions[onboardingStep - 1];
  const quickReplies = isAgeStep
    ? ["18", "25", "40", "65"]
    : onboardingStep === 1
      ? [t.male, t.female]
      : onboardingStep === 2
        ? [t.none, t.diabetes, t.hypertension, t.asthma]
        : onboardingStep === 3
          ? [t.none, t.yes]
          : [];

  const showOnboardingAlert = (title: string, message: string, tone: OnboardingAlert["tone"] = "error") => {
    setOnboardingAlert({ title, message, tone });
  };

  const normalizeAgeAnswer = (value: string) => {
    const matches = value.match(/\d+/g) ?? [];

    if (matches.length !== 1) {
      return null;
    }

    const age = Number(matches[0]);
    if (!Number.isInteger(age) || age < 1 || age > 116) {
      return null;
    }

    return String(age);
  };

  const sanitizeAgeInput = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 3);

    if (!digitsOnly) {
      return "";
    }

    const numericValue = Number(digitsOnly);
    if (numericValue > 116) {
      return "116";
    }

    return digitsOnly;
  };

  const normalizeAnswer = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (!isAgeStep) {
      return trimmed;
    }

    const normalizedAge = normalizeAgeAnswer(trimmed);
    if (!normalizedAge) {
      showOnboardingAlert(t.ageAlertTitle, t.ageAlertMessage);
      return null;
    }

    setOnboardingAlert(null);
    return normalizedAge;
  };

  const showNextOnboardingQuestion = (stepIndex: number, delay: number, shouldSpeak = false) => {
    setTimeout(() => scrollToBottom(), 100);
    setTimeout(() => {
      const nextQuestion = t.onboardingQuestions[stepIndex];
      if (!nextQuestion) return;

      const nextId = Date.now();
      setMessages((prev) => [...prev, { id: nextId, role: "ai", content: nextQuestion }]);
      setTypingId(nextId);
      setOnboardingStep(stepIndex + 1);

      setTimeout(() => {
        const el = document.getElementById(`message-${nextId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      if (shouldSpeak) {
        void speakResponse(nextQuestion);
      }
    }, delay);
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    setOnboardingAlert(null);
  }, [onboardingStep, currentSessionId, lang]);

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
      setOnboardingAlert({
        title: lang === "en" ? "Microphone Access Required" : "مطلوب الوصول إلى الميكروفون",
        message: t.micError,
        tone: "error"
      });
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

      if (!transcribeRes.ok) {
        const errorData = await transcribeRes.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Transcription failed");
      }

      const transcribeData = await transcribeRes.json();
      const userText = transcribeData.text;
      const normalizedUserText = normalizeAnswer(userText);

      if (!normalizedUserText) {
        return;
      }

      const userMsg: Message = { 
        id: Date.now(), 
        role: "user", 
        content: normalizedUserText
      };
      
      const newMessagesList = [...messages, userMsg];
      setMessages(newMessagesList);
      
      if (onboardingStep < 3) {
        showNextOnboardingQuestion(onboardingStep, 500, true);
        return;
      } else if (onboardingStep < 4) {
        setOnboardingStep(4);
      }
      
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
      const errorMessage = error instanceof Error ? error.message : t.voiceError;
      setMessages((prev) => [...prev, {
        id: Date.now(),
        role: "ai",
        content: `${t.error} ${errorMessage}`,
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
    if (isOnboardingActive) {
      e.target.value = "";
      showOnboardingAlert(t.onboardingAttachmentTitle, t.onboardingAttachmentMessage, "info");
      return;
    }

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

  const handleQuickReply = async (reply: string) => {
    setInputValue(reply);
    const normalized = normalizeAnswer(reply);
    if (!normalized) return;

    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    setInputValue(normalized);
    await Promise.resolve();
    await handleSubmit(syntheticEvent, normalized);
  };

  const handleSubmit = async (e: React.FormEvent, prefilledValue?: string) => {
    e.preventDefault();
    const rawInput = prefilledValue ?? inputValue.trim();

    if ((!rawInput && attachedImages.length === 0) || isLoading) return;

    const normalizedInput = rawInput ? normalizeAnswer(rawInput) : rawInput;
    if (rawInput && !normalizedInput) return;

    const newMsg: Message = { 
      id: Date.now(), 
      role: "user", 
      content: normalizedInput || (attachedImages.length > 0 ? t.imageAnalysis : ""),
      images: attachedImages.length > 0 ? [...attachedImages] : undefined
    };
    
    const newMessagesList = [...messages, newMsg];
    setMessages(newMessagesList);
    
    setInputValue("");
    setAttachedImages([]);
    
    // Quick onboarding flow check
    if (onboardingStep < 3 && attachedImages.length === 0) {
      showNextOnboardingQuestion(onboardingStep, 600);
      return;
    } else if (onboardingStep < 4) {
      setOnboardingStep(4);
    }
    
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
      console.error("Chat error:", error);
      let errorMessage = t.serverError;
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = t.networkError;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setMessages((prev) => [
        ...prev, 
        { id: Date.now(), role: "ai", content: `${t.error} ${errorMessage}` }
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
         <div className="w-72 bg-gradient-to-b from-slate-50 to-white backdrop-blur-xl h-full flex flex-col p-4 gap-6 flex-shrink-0 border-r border-slate-200/50">
            <button 
              onClick={createNewChat}
              className="group flex items-center gap-3 justify-center w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl py-3.5 px-4 font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm tracking-tight">{t.newChat}</span>
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">{t.recentChats}</h3>
               <div className="flex flex-col gap-2 px-1">
                 {sessions.sort((a,b) => b.updatedAt - a.updatedAt).map(session => (
                    <button
                      key={session.id}
                      onClick={() => { 
                        setCurrentSessionId(session.id); 
                        setIsSidebarOpen(false); 
                        // Estimate step based on messages length for returning chats
                        if (session.messages.length < 7) {
                          setOnboardingStep(Math.floor(session.messages.length / 2));
                        } else {
                          setOnboardingStep(4);
                        }
                      }}
                      className={`group relative text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                        session.id === currentSessionId 
                          ? "bg-white shadow-lg ring-2 ring-blue-600/20 border border-blue-100" 
                          : "hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent"
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
        {/* Modern Professional Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-4 md:px-8 py-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="p-2.5 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {lang === "ar" ? <PanelRight size={22} className={!isSidebarOpen ? "" : "text-blue-600"} /> : <PanelLeft size={22} className={!isSidebarOpen ? "" : "text-blue-600"} />}
            </button>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-600/25 flex-shrink-0 relative group">
                <Activity size={24} className="text-white group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-none">{t.title}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] md:text-xs font-semibold text-emerald-600">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              disabled={isTranslating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isTranslating ? (
                <>
                  <Loader2 size={16} className="text-blue-600 animate-spin" />
                  <span>{t.translating}</span>
                </>
              ) : (
                <>
                  <Globe size={16} className="text-slate-500" />
                  <span>{lang === "en" ? "العربية" : "English"}</span>
                </>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-36 pt-4 scroll-smooth">
          <div className="max-w-3xl mx-auto px-4 flex flex-col gap-8">
            {messages.map((msg) => (
              <div key={msg.id} className="contents">
                <div 
                  id={`message-${msg.id}`}
                  className={`flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 relative mt-1 ${
                      msg.role === "user" 
                        ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 text-slate-100 shadow-lg shadow-slate-900/20" 
                        : "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 border-2 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                    }`}>
                      {msg.role === "user" ? <User size={16} /> : <Activity size={18} className="text-white" />}
                      <div className={`absolute inset-0 rounded-2xl ${
                        msg.role === "user" 
                          ? "bg-gradient-to-br from-slate-600/20 to-transparent" 
                          : "bg-gradient-to-br from-blue-400/20 to-transparent"
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className={`px-5 md:px-6 py-3.5 rounded-2xl md:rounded-[1.75rem] shadow-md transition-all duration-300 ${
                        msg.role === "user" 
                          ? `bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/20 border border-blue-500/20 ${lang === 'ar' ? 'rounded-tl-sm md:rounded-tl-sm' : 'rounded-tr-sm md:rounded-tr-sm'}`
                          : `bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-lg ${lang === 'ar' ? 'rounded-tr-sm md:rounded-tr-sm' : 'rounded-tl-sm md:rounded-tl-sm'}`
                      }`}>
                        {msg.images && msg.images.length > 0 && (
                          <div className={`flex flex-wrap gap-2 mb-3 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.images.map((imgBase64, idx) => (
                              <div key={idx} className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-sm border border-black/5 group-hover:border-black/10 transition-colors">
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

                {isOnboardingActive && msg.id === messages[messages.length - 1]?.id && msg.role === "ai" && (
                  <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%]">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 relative mt-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 border-2 border-blue-500 text-white shadow-lg shadow-blue-500/30">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className={`px-5 md:px-6 py-5 rounded-2xl md:rounded-[1.75rem] rounded-tl-sm border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 shadow-lg shadow-blue-600/10`}>
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{t.onboardingCardTitle}</p>
                                </div>
                                <p className="text-sm font-bold text-slate-900 mb-1">{t.onboardingQuestionLabel}: {currentOnboardingQuestion}</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{isAgeStep ? t.ageHelper : t.onboardingCardSubtitle}</p>
                              </div>
                              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-3.5 py-2.5 text-center shadow-lg shadow-blue-600/20">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">{t.onboardingProgressLabel}</p>
                                <p className="text-lg font-bold text-white">{Math.min(onboardingStep + 1, 4)}/4</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{t.quickRepliesLabel}</p>
                              <div className="flex flex-wrap gap-2">
                                {quickReplies.map((reply) => (
                                  <button
                                    key={reply}
                                    type="button"
                                    onClick={() => void handleQuickReply(reply)}
                                    className="rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-md transition-all hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg active:translate-y-0"
                                  >
                                    {reply}
                                  </button>
                                ))}
                              </div>
                            </div>
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider px-1 text-slate-400 opacity-60">
                          {t.title}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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

          {/* Form Dock with Enhanced Design */}
          <div className="relative group">
            {/* Premium Animated Glowing Border */}
            <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 opacity-0 group-focus-within:opacity-100 blur-sm transition-all duration-500 bg-[length:200%_auto] animate-[shimmer_2s_linear_infinite]" />
            
            <form 
              onSubmit={handleSubmit} 
              className="relative z-10 flex items-end gap-2 bg-white backdrop-blur-xl ring-2 ring-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] rounded-[2rem] p-2 pl-4 focus-within:ring-blue-600 focus-within:ring-2 transition-all duration-300 group-focus-within:shadow-[0_20px_60px_rgba(37,99,235,0.15)]"
            >
              <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              
              <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isOnboardingActive}
                  className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex-shrink-0 self-center active:scale-90 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                  aria-label="Attach images"
                >
                  <ImageIcon size={20} />
                </button>

              {isAgeStep ? (
                <input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(sanitizeAgeInput(e.target.value));
                    if (onboardingAlert) setOnboardingAlert(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t.ageInputPlaceholder}
                  disabled={isLoading || isRecording}
                  inputMode="numeric"
                  maxLength={3}
                  aria-invalid={Boolean(onboardingAlert)}
                  className={`flex-1 bg-transparent py-4 px-1 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${onboardingAlert ? 'text-red-700 placeholder:text-red-300' : ''} ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  autoComplete="off"
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (onboardingAlert) setOnboardingAlert(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={currentOnboardingQuestion || t.placeholder}
                  disabled={isLoading || isRecording}
                  aria-invalid={false}
                  className={`flex-1 bg-transparent py-4 px-1 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 resize-none max-h-48 scrollbar-hide ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  autoComplete="off"
                />
              )}
              
              <div className="flex items-center gap-1.5 pr-1 self-center">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 active:scale-90 ${
                    isRecording
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                      : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  aria-label={isRecording ? "Stop recording" : "Start voice chat"}
                >
                  {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={20} />}
                </button>

                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !isRecording && attachedImages.length === 0) || isLoading}
                  className={`p-3.5 rounded-xl flex-shrink-0 transition-all duration-300 shadow-md ${
                    ((!inputValue.trim() && !isRecording && attachedImages.length === 0) || isLoading)
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 hover:from-blue-700 hover:to-blue-800"
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
            {onboardingAlert && (
              <div className={`w-full max-w-3xl pointer-events-auto animate-in slide-in-from-bottom-2 duration-300 rounded-2xl border px-4 py-3 shadow-sm ${onboardingAlert.tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{onboardingAlert.title}</p>
                    <p className="text-xs font-medium opacity-90">{onboardingAlert.message}</p>
                  </div>
                </div>
              </div>
            )}

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
