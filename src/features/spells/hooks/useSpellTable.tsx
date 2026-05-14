import { useMemo, useState } from "react"
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { Spell, FilterState, School } from "../data/types"
import { emptyFilters } from "../data/types"
import { useLanguage } from "@/i18n/LanguageContext"
import { useSpellbooksContext } from "@/features/spellbooks/SpellbooksContext"
import { parseRange, parseDuration } from "../data/parse"
import { CellWithTooltip } from "../components/CellWithTooltip"
import { DamageTypeCell } from "../components/DamageTypeBadge"
import { readInitialFilters, useSyncFiltersToURL } from "./useFiltersSearchParams"

const matchesMultiSelect = <T,>(filter: T[], value: T): boolean =>
  filter.length === 0 || filter.includes(value)

const matchesArrayAny = <T,>(filter: T[], values: T[]): boolean =>
  filter.length === 0 || filter.some((f) => values.includes(f))

const matchesArrayAll = <T,>(filter: T[], values: T[]): boolean =>
  filter.length === 0 || filter.every((f) => values.includes(f))

const matchesBoolFilter = (filter: boolean | null, value: boolean): boolean =>
  filter === null || filter === value

export const useSpellTable = (spells: Spell[]) => {
  const { t } = useLanguage()
  const { spellbooks } = useSpellbooksContext()
  const [filters, setFilters] = useState<FilterState>(readInitialFilters)
  useSyncFiltersToURL(filters)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "level", desc: false },
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filteredSpells = useMemo(() => {
    const selectedSpellbooks = spellbooks.filter((g) =>
      filters.spellbooks.includes(g.id)
    )

    return spells.filter((spell) => {
      if (!matchesMultiSelect(filters.levels, spell.level)) return false
      if (!matchesMultiSelect(filters.schools, spell.school)) return false
      if (!matchesArrayAny(filters.classes, spell.classes)) return false
      if (!matchesArrayAll(filters.components, spell.components)) return false
      if (!matchesBoolFilter(filters.concentration, spell.concentration)) return false
      if (!matchesBoolFilter(filters.ritual, spell.ritual)) return false
      if (!matchesMultiSelect(filters.sources, spell.source)) return false
      if (!matchesArrayAny(filters.damageTypes, spell.damage_types)) return false
      if (filters.search !== "" && !spell.name.toLowerCase().includes(filters.search.toLowerCase())) return false

      if (selectedSpellbooks.length > 0) {
        if (filters.spellbookMode === "exclude") {
          // Exclude if the spell is in ANY selected spellbook
          if (selectedSpellbooks.some((g) => g.spellSlugs.includes(spell.slug))) return false
        } else {
          // Include only if the spell is in ALL selected spellbooks
          if (!selectedSpellbooks.every((g) => g.spellSlugs.includes(spell.slug))) return false
        }
      }

      return true
    })
  }, [spells, filters, spellbooks])

  const columns = useMemo<ColumnDef<Spell>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomeRowsSelected()
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-input"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-input"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: () => t("column.name"),
        cell: (info) => {
          const spell = info.row.original
          const desc = spell.description
          const truncated =
            desc && desc.length > 300 ? desc.slice(0, 300) + "…" : desc
          return (
            <CellWithTooltip
              tooltip={truncated}
              className="max-w-md whitespace-pre-line text-left"
            >
              <span className="block max-w-56 truncate">
                {info.getValue() as string}
              </span>
            </CellWithTooltip>
          )
        },
      },
      {
        accessorKey: "level",
        header: () => t("column.level"),
        cell: (info) =>
          info.getValue() === 0
            ? t("level.cantrip")
            : String(info.getValue()),
      },
      {
        accessorKey: "school",
        header: () => t("column.school"),
        cell: (info) =>
          t(`school.${info.getValue() as School}` as `school.${School}`),
      },
      {
        accessorKey: "casting_time",
        header: () => t("column.castingTime"),
        cell: (info) => {
          const value = info.getValue() as string
          return (
            <CellWithTooltip tooltip={value.length > 20 ? value : undefined}>
              <span className="block max-w-48 truncate">{value}</span>
            </CellWithTooltip>
          )
        },
      },
      {
        accessorKey: "range",
        header: () => t("column.range"),
        sortingFn: (a, b) =>
          parseRange(a.original.range) - parseRange(b.original.range),
      },
      {
        accessorKey: "duration",
        header: () => t("column.duration"),
        cell: (info) => {
          const value = info.getValue() as string
          return (
            <CellWithTooltip tooltip={value.length > 20 ? value : undefined}>
              <span className="block max-w-36 truncate">{value}</span>
            </CellWithTooltip>
          )
        },
        sortingFn: (a, b) =>
          parseDuration(a.original.duration) -
          parseDuration(b.original.duration),
      },
      {
        accessorKey: "components",
        header: () => t("column.components"),
        cell: (info) => {
          const spell = info.row.original
          const materialMatch = spell.components_detail.match(/\((.+)\)\s*$/)
          const materialDetail = materialMatch ? materialMatch[1] : undefined
          return (
            <CellWithTooltip tooltip={materialDetail}>
              {(info.getValue() as string[]).join(", ")}
            </CellWithTooltip>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "concentration",
        header: () => t("column.concentration"),
        cell: (info) => (info.getValue() ? "✦" : ""),
      },
      {
        accessorKey: "ritual",
        header: () => t("column.ritual"),
        cell: (info) => (info.getValue() ? "✦" : ""),
      },
      {
        accessorKey: "damage_types",
        header: () => t("column.damageType"),
        cell: (info) => (
          <DamageTypeCell types={info.getValue() as Spell["damage_types"]} />
        ),
        enableSorting: false,
      },
    ],
    [t]
  )

  const table = useReactTable({
    data: filteredSpells,
    columns,
    state: { sorting, rowSelection },
    getRowId: (row) => row.slug,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
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
    filters.levels.length > 0 ||
    filters.schools.length > 0 ||
    filters.classes.length > 0 ||
    filters.components.length > 0 ||
    filters.concentration !== null ||
    filters.ritual !== null ||
    filters.sources.length > 0 ||
    filters.search !== "" ||
    filters.spellbooks.length > 0 ||
    filters.damageTypes.length > 0

  const selectedSlugs = Object.keys(rowSelection).filter((k) => rowSelection[k])
  const clearSelection = () => setRowSelection({})

  return {
    table,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filteredCount: filteredSpells.length,
    totalCount: spells.length,
    selectedSlugs,
    clearSelection,
  }
}
