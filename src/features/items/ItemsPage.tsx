import { useMemo, useState } from "react"
import type { Item } from "./data/types"
import { buildItemList } from "./data/items"
import { useLanguage } from "@/i18n/LanguageContext"
import { useItemTable } from "./hooks/useItemTable"
import { ItemFilters } from "./components/ItemFilters"
import { ItemTable } from "./components/ItemTable"
import { ItemDetailSheet } from "./components/ItemDetailSheet"

export const ItemsPage = () => {
  const { lang } = useLanguage()
  const items = useMemo(() => buildItemList(lang), [lang])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const {
    table,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filteredCount,
    totalCount,
  } = useItemTable(items)

  return (
    <div className="flex flex-col gap-4">
      <ItemFilters
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredCount}
        totalCount={totalCount}
      />
      <ItemTable table={table} onSelectItem={setSelectedItem} />
      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSelectVariant={setSelectedItem}
      />
    </div>
  )
}
