import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext"
import { LanguageToggle } from "@/components/LanguageToggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SpellsPage } from "@/features/spells/SpellsPage"

const AppContent = () => {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("spells.title")}</h1>
        <LanguageToggle />
      </header>
      <main>
        <SpellsPage />
      </main>
    </div>
  )
}

const App = () => (
  <LanguageProvider>
    <TooltipProvider delay={500}>
      <AppContent />
    </TooltipProvider>
  </LanguageProvider>
)

export default App
