export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type ChronicCondition =
  | "diabetes"
  | "hypertension"
  | "heart_disease"
  | "kidney_disease"
  | "liver_disease"
  | "asthma"
  | "thyroid"
  | "cancer"
  | "none";

export interface UserProfile {
  age: number;
  gender: Gender;
  chronicConditions: ChronicCondition[];
  currentMedications: string;
  knownAllergies: string;
  isPregnant: boolean;
  isNursing: boolean;
  completedAt: number;
}

export const CHRONIC_CONDITION_LABELS: Record<ChronicCondition, { en: string; ar: string }> = {
  diabetes:       { en: "Diabetes",          ar: "السكري" },
  hypertension:   { en: "Hypertension",       ar: "ارتفاع ضغط الدم" },
  heart_disease:  { en: "Heart Disease",      ar: "أمراض القلب" },
  kidney_disease: { en: "Kidney Disease",     ar: "أمراض الكلى" },
  liver_disease:  { en: "Liver Disease",      ar: "أمراض الكبد" },
  asthma:         { en: "Asthma",             ar: "الربو" },
  thyroid:        { en: "Thyroid Disorder",   ar: "اضطراب الغدة الدرقية" },
  cancer:         { en: "Cancer",             ar: "السرطان" },
  none:           { en: "None of the above",  ar: "لا شيء مما سبق" },
};

export const GENDER_LABELS: Record<Gender, { en: string; ar: string }> = {
  male:               { en: "Male",                 ar: "ذكر" },
  female:             { en: "Female",               ar: "أنثى" },
  other:              { en: "Other",                ar: "أخرى" },
  prefer_not_to_say:  { en: "Prefer not to say",    ar: "أفضل عدم الإفصاح" },
};
