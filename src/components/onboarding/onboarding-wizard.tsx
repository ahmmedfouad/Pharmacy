"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Check, User, Heart, Pill, AlertCircle, Baby } from "lucide-react";
import type {
  Gender,
  ChronicCondition,
  UserProfile,
} from "@/types/user-profile";
import {
  CHRONIC_CONDITION_LABELS,
  GENDER_LABELS,
} from "@/types/user-profile";

const ALL_CONDITIONS = Object.keys(CHRONIC_CONDITION_LABELS) as ChronicCondition[];

type Step = "age" | "gender" | "conditions" | "medications" | "allergies" | "pregnancy";

const STEPS_BASE: Step[] = ["age", "gender", "conditions", "medications", "allergies"];

interface OnboardingWizardProps {
  lang: "en" | "ar";
  onComplete: (profile: UserProfile) => void;
}

const T = {
  en: {
    heading: "Let's get to know you",
    subheading: "This helps us give you safer, more personalised medical advice.",
    stepAge: { title: "How old are you?", label: "Age", placeholder: "e.g. 32", error: "Please enter a valid age between 1 and 120." },
    stepGender: { title: "What is your gender?" },
    stepConditions: { title: "Do you have any chronic conditions?", hint: "Select all that apply." },
    stepMedications: { title: "Are you taking any medications?", label: "Current medications", placeholder: "e.g. Metformin 500 mg, Aspirin 100 mg\n(Leave blank if none)" },
    stepAllergies: { title: "Do you have any known allergies?", label: "Known allergies", placeholder: "e.g. Penicillin, Sulfa drugs\n(Leave blank if none)" },
    stepPregnancy: { title: "Pregnancy & nursing", pregnant: "Currently pregnant", nursing: "Currently breastfeeding / nursing" },
    back: "Back",
    next: "Next",
    finish: "Start Chat",
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
  },
  ar: {
    heading: "دعنا نتعرف عليك",
    subheading: "يساعدنا ذلك على تقديم نصائح طبية أكثر أماناً وتخصيصاً.",
    stepAge: { title: "كم عمرك؟", label: "العمر", placeholder: "مثلاً: 32", error: "يرجى إدخال عمر صحيح بين 1 و120." },
    stepGender: { title: "ما هو جنسك؟" },
    stepConditions: { title: "هل لديك أمراض مزمنة؟", hint: "اختر كل ما ينطبق عليك." },
    stepMedications: { title: "هل تتناول أي أدوية؟", label: "الأدوية الحالية", placeholder: "مثلاً: ميتفورمين 500 مجم، أسبرين 100 مجم\n(اتركه فارغاً إن لم يكن هناك أدوية)" },
    stepAllergies: { title: "هل لديك حساسية معروفة؟", label: "الحساسيات المعروفة", placeholder: "مثلاً: البنسلين، أدوية السلفا\n(اتركه فارغاً إن لم يكن هناك حساسية)" },
    stepPregnancy: { title: "الحمل والرضاعة", pregnant: "حامل حالياً", nursing: "مرضعة حالياً" },
    back: "السابق",
    next: "التالي",
    finish: "ابدأ المحادثة",
    stepOf: (current: number, total: number) => `الخطوة ${current} من ${total}`,
  },
} as const;

export function OnboardingWizard({ lang, onComplete }: OnboardingWizardProps) {
  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Form state
  const [age, setAge] = useState<string>("");
  const [ageError, setAgeError] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [conditions, setConditions] = useState<ChronicCondition[]>([]);
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [isNursing, setIsNursing] = useState(false);

  // Wizard navigation
  const showPregnancy = gender === "female";
  const steps: Step[] = showPregnancy ? [...STEPS_BASE, "pregnancy"] : STEPS_BASE;
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const toggleCondition = (cond: ChronicCondition) => {
    if (cond === "none") {
      setConditions(conditions.includes("none") ? [] : ["none"]);
      return;
    }
    setConditions(prev => {
      const without = prev.filter(c => c !== "none");
      return without.includes(cond) ? without.filter(c => c !== cond) : [...without, cond];
    });
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === "age") {
      const num = Number(age);
      if (!age || isNaN(num) || num < 1 || num > 120 || !Number.isInteger(num)) {
        setAgeError(true);
        return false;
      }
      setAgeError(false);
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (isLastStep) {
      const profile: UserProfile = {
        age: Number(age),
        gender: gender ?? "prefer_not_to_say",
        chronicConditions: conditions.length === 0 ? ["none"] : conditions,
        currentMedications: medications.trim(),
        knownAllergies: allergies.trim(),
        isPregnant: showPregnancy ? isPregnant : false,
        isNursing: showPregnancy ? isNursing : false,
        completedAt: Date.now(),
      };
      onComplete(profile);
    } else {
      setStepIndex(i => i + 1);
    }
  };

  const handleBack = () => setStepIndex(i => i - 1);

  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir={dir}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
              <StepIcon step={currentStep} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.heading}</h2>
            <p className="text-sm text-slate-500 mt-1">{t.subheading}</p>
            <p className="text-xs text-blue-600 font-semibold mt-2">{t.stepOf(stepIndex + 1, steps.length)}</p>
          </div>

          {/* Step content */}
          <div className="min-h-[200px]">
            {currentStep === "age" && (
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-800">{t.stepAge.title}</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={e => { setAge(e.target.value); setAgeError(false); }}
                  placeholder={t.stepAge.placeholder}
                  className={`w-full border rounded-xl px-4 py-3 text-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                    ageError ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"
                  }`}
                  onKeyDown={e => e.key === "Enter" && handleNext()}
                  autoFocus
                />
                {ageError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {t.stepAge.error}
                  </p>
                )}
              </div>
            )}

            {currentStep === "gender" && (
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-800">{t.stepGender.title}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(GENDER_LABELS) as Gender[]).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                        gender === g
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      {gender === g && <Check size={14} />}
                      {GENDER_LABELS[g][lang]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "conditions" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-base font-semibold text-slate-800">{t.stepConditions.title}</label>
                  <p className="text-xs text-slate-500 mt-0.5">{t.stepConditions.hint}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ALL_CONDITIONS.map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-medium text-left transition-all ${
                        conditions.includes(cond)
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                        conditions.includes(cond) ? "bg-blue-600 border-blue-600" : "border-slate-300"
                      }`}>
                        {conditions.includes(cond) && <Check size={10} className="text-white" />}
                      </span>
                      {CHRONIC_CONDITION_LABELS[cond][lang]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "medications" && (
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-800">{t.stepMedications.title}</label>
                <textarea
                  rows={4}
                  value={medications}
                  onChange={e => setMedications(e.target.value)}
                  placeholder={t.stepMedications.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {currentStep === "allergies" && (
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-800">{t.stepAllergies.title}</label>
                <textarea
                  rows={4}
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder={t.stepAllergies.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {currentStep === "pregnancy" && (
              <div className="space-y-4">
                <label className="block text-base font-semibold text-slate-800">{t.stepPregnancy.title}</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isPregnant}
                      onChange={e => setIsPregnant(e.target.checked)}
                      className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 font-medium">{t.stepPregnancy.pregnant}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isNursing}
                      onChange={e => setIsNursing(e.target.checked)}
                      className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 font-medium">{t.stepPregnancy.nursing}</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`flex mt-8 gap-3 ${stepIndex > 0 ? "justify-between" : "justify-end"}`}>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
              >
                {lang === "ar" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                {t.back}
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm shadow-sm active:scale-95"
            >
              {isLastStep ? t.finish : t.next}
              {!isLastStep && (lang === "ar" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
              {isLastStep && <Check size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ step }: { step: Step }) {
  switch (step) {
    case "age": return <User size={24} className="text-blue-600" />;
    case "gender": return <User size={24} className="text-blue-600" />;
    case "conditions": return <Heart size={24} className="text-blue-600" />;
    case "medications": return <Pill size={24} className="text-blue-600" />;
    case "allergies": return <AlertCircle size={24} className="text-blue-600" />;
    case "pregnancy": return <Baby size={24} className="text-blue-600" />;
  }
}
