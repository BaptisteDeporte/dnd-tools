import { useMemo, useState } from "react"
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { Category, FilterState, Item, Rarity } from "../data/types"
import { emptyFilters, RARITY_ORDER } from "../data/types"
import { useLanguage } from "@/i18n/LanguageContext"
import { matchesBoolFilter, matchesMultiSelect } from "@/lib/filters"
import { CellWithTooltip } from "@/features/spells/components/CellWithTooltip"
import { Badge } from "@/components/ui/badge"
import {
  readInitialFilters,
  useSyncFiltersToURL,
} from "./useFiltersSearchParams"

const RARITY_BADGE_CLASS: Record<Rarity, string> = {
  Common: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  Uncommon: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Rare: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "Very Rare": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  Legendary: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Artifact: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
}

const minRarityIndex = (rarities: Rarity[]): number =>
  rarities.length === 0
    ? RARITY_ORDER.length
    : Math.min(...rarities.map((r) => RARITY_ORDER.indexOf(r)))

export const useItemTable = (items: Item[]) => {
  const { t } = useLanguage()
  const [filters, setFilters] = useState<FilterState>(readInitialFilters)
  useSyncFiltersToURL(filters)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ])

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (!matchesMultiSelect(filters.categories, item.category)) return false
        if (
          filters.rarities.length > 0 &&
          !item.rarities.some((r) => filters.rarities.includes(r))
        )
          return false
        if (!matchesBoolFilter(filters.attunement, item.requiresAttunement))
          return false
        if (
          filters.search !== "" &&
          !item.name.toLowerCase().includes(filters.search.toLowerCase())
        )
          return false
        return true
      }),
    [items, filters]
  )

  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => t("column.name"),
        cell: (info) => {
          const item = info.row.original
          const tooltip = item.desc[0]
          return (
            <CellWithTooltip
              tooltip={tooltip}
              className="max-w-md whitespace-pre-line text-left"
            >
              <span className="block max-w-72 truncate">{item.name}</span>
            </CellWithTooltip>
          )
        },
      },
      {
        accessorKey: "category",
        header: () => t("column.category"),
        cell: (info) =>
          t(`category.${info.getValue() as Category}` as const),
      },
      {
        id: "rarities",
        accessorFn: (row) => row.rarities,
        header: () => t("column.rarity"),
        cell: (info) => {
          const rarities = info.getValue() as Rarity[]
          return (
            <div className="flex flex-wrap gap-1">
              {rarities.map((r) => (
                <Badge
                  key={r}
                  variant="secondary"
                  className={RARITY_BADGE_CLASS[r]}
                >
                  {t(`rarity.${r}` as const)}
                </Badge>
              ))}
            </div>
          )
        },
        sortingFn: (a, b) =>
          minRarityIndex(a.original.rarities) -
          minRarityIndex(b.original.rarities),
      },
      {
        accessorKey: "requiresAttunement",
        header: () => t("column.attunement"),
        cell: (info) => (info.getValue() ? "✦" : ""),
      },
    ],
    [t]
  )

  const table = useReactTable({
    data: filteredItems,
    columns,
    state: { sorting },
    getRowId: (row) => row.slug,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => setFilters((prev) => ({ ...prev, [key]: value }))

  const clearFilters = () => setFilters(emptyFilters)

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.rarities.length > 0 ||
    filters.attunement !== null ||
    filters.search !== ""

  return {
    table,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filteredCount: filteredItems.length,
    totalCount: items.length,
  }
}
