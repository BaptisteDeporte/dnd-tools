import { useState } from "react"
import type { Category, FilterState, Rarity } from "../data/types"
import { RARITY_ORDER } from "../data/types"
import { allCategories } from "../data/items"
import { useLanguage } from "@/i18n/LanguageContext"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/features/spells/components/MultiSelect"
import { TriStateToggle } from "@/features/spells/components/TriStateToggle"
import { SearchInput } from "@/features/spells/components/SearchInput"

interface ItemFiltersProps {
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

export const ItemFilters = ({
  filters,
  updateFilter,
  clearFilters,
  hasActiveFilters,
  filteredCount,
  totalCount,
}: ItemFiltersProps) => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect<Category>
          label={t("filter.category")}
          options={allCategories.map((c) => ({
            value: c,
            label: t(`category.${c}` as const),
          }))}
          selected={filters.categories}
          onChange={(v) => updateFilter("categories", v)}
        />
        <MultiSelect<Rarity>
          label={t("filter.rarity")}
          options={RARITY_ORDER.map((r) => ({
            value: r,
            label: t(`rarity.${r}` as const),
          }))}
          selected={filters.rarities}
          onChange={(v) => updateFilter("rarities", v)}
        />
        <TriStateToggle
          label={t("filter.attunement")}
          value={filters.attunement}
          onChange={(v) => updateFilter("attunement", v)}
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
          placeholderKey="items.search.placeholder"
        />
        <span className="text-sm text-muted-foreground">
          {filteredCount === totalCount
            ? t("items.count", { count: totalCount })
            : `${filteredCount} / ${t("items.count", { count: totalCount })}`}
        </span>
      </div>
    </div>
  )
}
