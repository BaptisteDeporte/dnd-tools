import { useMemo, useState } from "react"
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { Spell, FilterState, School } from "../data/types"
import { emptyFilters } from "../data/types"
import { useLanguage } from "@/i18n/LanguageContext"
import { parseRange, parseDuration } from "../data/parse"
import { CellWithTooltip } from "../components/CellWithTooltip"
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
  const [filters, setFilters] = useState<FilterState>(readInitialFilters)
  useSyncFiltersToURL(filters)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "level", desc: false },
  ])

  const filteredSpells = useMemo(
    () =>
      spells.filter(
        (spell) =>
          matchesMultiSelect(filters.levels, spell.level) &&
          matchesMultiSelect(filters.schools, spell.school) &&
          matchesArrayAny(filters.classes, spell.classes) &&
          matchesArrayAll(filters.components, spell.components) &&
          matchesBoolFilter(filters.concentration, spell.concentration) &&
          matchesBoolFilter(filters.ritual, spell.ritual) &&
          matchesMultiSelect(filters.sources, spell.source) &&
          (filters.search === "" ||
            spell.name.toLowerCase().includes(filters.search.toLowerCase()))
      ),
    [spells, filters]
  )

  const columns = useMemo<ColumnDef<Spell>[]>(
    () => [
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
    ],
    [t]
  )

  const table = useReactTable({
    data: filteredSpells,
    columns,
    state: { sorting },
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
    filters.levels.length > 0 ||
    filters.schools.length > 0 ||
    filters.classes.length > 0 ||
    filters.components.length > 0 ||
    filters.concentration !== null ||
    filters.ritual !== null ||
    filters.sources.length > 0 ||
    filters.search !== ""

  return {
    table,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filteredCount: filteredSpells.length,
    totalCount: spells.length,
  }
}
