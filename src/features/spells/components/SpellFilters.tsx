import { useState } from "react"
import type { FilterState, School, DndClass, Component } from "../data/types"
import { allSources } from "../data/spells"
import { useLanguage } from "@/i18n/LanguageContext"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "./MultiSelect"
import { TriStateToggle } from "./TriStateToggle"
import { SearchInput } from "./SearchInput"

const SCHOOLS: School[] = [
  "abjuration",
  "conjuration",
  "divination",
  "enchantment",
  "evocation",
  "illusion",
  "necromancy",
  "transmutation",
]

const CLASSES: DndClass[] = [
  "Artificer",
  "Bard",
  "Cleric",
  "Druid",
  "Paladin",
  "Ranger",
  "Sorcerer",
  "Warlock",
  "Wizard",
]

const COMPONENTS: Component[] = ["V", "S", "M"]
const LEVELS = Array.from({ length: 10 }, (_, i) => i)

interface SpellFiltersProps {
  filters: FilterState
  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  filteredCount: number
  totalCount: number
}

const ShareButton = ({ hasActiveFilters }: { hasActiveFilters: boolean }) => {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!hasActiveFilters) return null

  return (
    <Button variant="default" size="lg" onClick={handleShare}>
      {copied ? t("share.copied") : t("share.copy")}
    </Button>
  )
}

export const SpellFilters = ({
  filters,
  updateFilter,
  clearFilters,
  hasActiveFilters,
  filteredCount,
  totalCount,
}: SpellFiltersProps) => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect
          label={t("filter.level")}
          options={LEVELS.map((l) => ({
            value: l,
            label: l === 0 ? t("level.cantrip") : String(l),
          }))}
          selected={filters.levels}
          onChange={(v) => updateFilter("levels", v)}
        />
        <MultiSelect
          label={t("filter.school")}
          options={SCHOOLS.map((s) => ({
            value: s,
            label: t(`school.${s}` as `school.${School}`),
          }))}
          selected={filters.schools}
          onChange={(v) => updateFilter("schools", v)}
        />
        <MultiSelect
          label={t("filter.class")}
          options={CLASSES.map((c) => ({ value: c, label: t(`class.${c}` as `class.${DndClass}`) }))}
          selected={filters.classes}
          onChange={(v) => updateFilter("classes", v)}
        />
        <MultiSelect
          label={t("filter.components")}
          options={COMPONENTS.map((c) => ({ value: c, label: c }))}
          selected={filters.components}
          onChange={(v) => updateFilter("components", v)}
        />
        <TriStateToggle
          label={t("filter.concentration")}
          value={filters.concentration}
          onChange={(v) => updateFilter("concentration", v)}
        />
        <TriStateToggle
          label={t("filter.ritual")}
          value={filters.ritual}
          onChange={(v) => updateFilter("ritual", v)}
        />
        <MultiSelect
          label={t("filter.source")}
          options={allSources.map((s) => ({ value: s, label: s }))}
          selected={filters.sources}
          onChange={(v) => updateFilter("sources", v)}
        />
        {hasActiveFilters && (
          <Button variant="outline" size="lg" onClick={clearFilters}>
            {t("filter.clear")}
          </Button>
        )}
        <ShareButton hasActiveFilters={hasActiveFilters} />
      </div>
      <div className="flex items-center justify-between">
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter("search", v)}
        />
        <span className="text-sm text-muted-foreground">
          {filteredCount === totalCount
            ? t("spells.count", { count: totalCount })
            : `${filteredCount} / ${t("spells.count", { count: totalCount })}`}
        </span>
      </div>
    </div>
  )
}
