import { useState } from "react"
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext"
import { LanguageToggle } from "@/components/LanguageToggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SpellsPage } from "@/features/spells/SpellsPage"
import { GrimoiresPage } from "@/features/grimoires/GrimoiresPage"
import { GrimoiresProvider } from "@/features/grimoires/GrimoiresContext"

type Tab = "spells" | "grimoires"

const AppContent = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>("spells")

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("app.title")}</h1>
        <LanguageToggle />
      </header>

      {/* Tab bar */}
      <nav className="mb-6 flex gap-1 border-b">
        <TabButton
          label={t("tab.spells")}
          active={activeTab === "spells"}
          onClick={() => setActiveTab("spells")}
        />
        <TabButton
          label={t("tab.grimoires")}
          active={activeTab === "grimoires"}
          onClick={() => setActiveTab("grimoires")}
        />
      </nav>

      <main>
        {activeTab === "spells" ? <SpellsPage /> : <GrimoiresPage />}
      </main>
    </div>
  )
}

const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
      active
        ? "text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {label}
  </button>
)

const App = () => (
  <LanguageProvider>
    <GrimoiresProvider>
      <TooltipProvider delay={500}>
        <AppContent />
      </TooltipProvider>
    </GrimoiresProvider>
  </LanguageProvider>
)

export default App
