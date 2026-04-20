import { useLanguage } from "@/i18n/LanguageContext"

export const LanguageToggle = () => {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      <button
        onClick={() => setLang("fr")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          lang === "fr"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          lang === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  )
}
