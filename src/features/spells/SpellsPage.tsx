import { useMemo, useState } from "react"
import type { Spell } from "./data/types"
import { buildSpellList } from "./data/spells"
import { useLanguage } from "@/i18n/LanguageContext"
import { useSpellTable } from "./hooks/useSpellTable"
import { SpellFilters } from "./components/SpellFilters"
import { SpellTable } from "./components/SpellTable"
import { SpellDetailSheet } from "./components/SpellDetailSheet"
import { SpellSelectionBar } from "./components/SpellSelectionBar"

const COMPONENT_KEYS = ["V", "S", "M"] as const

const ComponentsLegend = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
      <span className="font-medium">{t("legend.title")} :</span>
      {COMPONENT_KEYS.map((c) => (
        <span key={c}>
          <span className="font-semibold text-foreground">{c}</span>
          {" — "}
          {t(`legend.${c}` as `legend.${typeof c}`).split(" — ")[1]}
        </span>
      ))}
    </div>
  )
}

export const SpellsPage = () => {
  const { lang } = useLanguage()
  const spells = useMemo(() => buildSpellList(lang), [lang])
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null)

  const {
    table,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filteredCount,
    totalCount,
    selectedSlugs,
    clearSelection,
  } = useSpellTable(spells)

  return (
    <div className="flex flex-col gap-4">
      <SpellFilters
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredCount}
        totalCount={totalCount}
      />
      <SpellTable table={table} onSelectSpell={setSelectedSpell} />
      <ComponentsLegend />
      <SpellDetailSheet
        spell={selectedSpell}
        onClose={() => setSelectedSpell(null)}
      />
      <SpellSelectionBar selectedSlugs={selectedSlugs} onClear={clearSelection} />
    </div>
  )
}
