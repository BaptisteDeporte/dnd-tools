import { createContext, use, useState, type ReactNode } from "react"
import type { Language } from "@/features/spells/data/types"
import { t, type TranslationKey } from "./translations"

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("fr")

  return (
    <LanguageContext value={{
      lang,
      setLang,
      t: (key, params) => t(lang, key, params),
    }}>
      {children}
    </LanguageContext>
  )
}

export const useLanguage = () => {
  const ctx = use(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
