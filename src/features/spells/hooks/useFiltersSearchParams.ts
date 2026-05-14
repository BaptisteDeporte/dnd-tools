import { useCallback, useEffect, useRef } from "react"
import type { FilterState, School, DndClass, Component, SpellbookFilterMode, DamageType } from "../data/types"
import { emptyFilters } from "../data/types"

const SCHOOLS: School[] = [
  "abjuration", "conjuration", "divination", "enchantment",
  "evocation", "illusion", "necromancy", "transmutation",
]
const CLASSES: DndClass[] = [
  "Artificer", "Bard", "Cleric", "Druid", "Paladin",
  "Ranger", "Sorcerer", "Warlock", "Wizard",
]
const COMPONENTS: Component[] = ["V", "S", "M"]
const DAMAGE_TYPES: DamageType[] = [
  "acid", "bludgeoning", "cold", "fire", "force", "lightning",
  "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder",
]

const parseList = <T extends string>(raw: string | null, allowed: readonly T[]): T[] => {
  if (!raw) return []
  return raw.split(",").filter((v): v is T => allowed.includes(v as T))
}

const parseBool = (raw: string | null): boolean | null => {
  if (raw === "1") return true
  if (raw === "0") return false
  return null
}

const parseLevels = (raw: string | null): number[] => {
  if (!raw) return []
  return raw.split(",").map(Number).filter((n) => !isNaN(n) && n >= 0 && n <= 9)
}

const parseSpellbookMode = (raw: string | null): SpellbookFilterMode => {
  if (raw === "include-all") return "include-all"
  return "exclude"
}

export const filtersFromSearchParams = (params: URLSearchParams): FilterState => ({
  levels: parseLevels(params.get("levels")),
  schools: parseList(params.get("schools"), SCHOOLS),
  classes: parseList(params.get("classes"), CLASSES),
  components: parseList(params.get("components"), COMPONENTS),
  concentration: parseBool(params.get("conc")),
  ritual: parseBool(params.get("ritual")),
  sources: params.get("sources")?.split(",").filter(Boolean) ?? [],
  search: params.get("q") ?? "",
  spellbooks: params.get("spellbooks")?.split(",").filter(Boolean) ?? [],
  spellbookMode: parseSpellbookMode(params.get("spellbookMode")),
  damageTypes: parseList(params.get("dmg"), DAMAGE_TYPES),
})

export const filtersToSearchParams = (filters: FilterState): URLSearchParams => {
  const params = new URLSearchParams()
  if (filters.levels.length > 0) params.set("levels", filters.levels.join(","))
  if (filters.schools.length > 0) params.set("schools", filters.schools.join(","))
  if (filters.classes.length > 0) params.set("classes", filters.classes.join(","))
  if (filters.components.length > 0) params.set("components", filters.components.join(","))
  if (filters.concentration !== null) params.set("conc", filters.concentration ? "1" : "0")
  if (filters.ritual !== null) params.set("ritual", filters.ritual ? "1" : "0")
  if (filters.sources.length > 0) params.set("sources", filters.sources.join(","))
  if (filters.search) params.set("q", filters.search)
  if (filters.spellbooks.length > 0) {
    params.set("spellbooks", filters.spellbooks.join(","))
    if (filters.spellbookMode !== "exclude") params.set("spellbookMode", filters.spellbookMode)
  }
  if (filters.damageTypes.length > 0) params.set("dmg", filters.damageTypes.join(","))
  return params
}

const isEmptyFilters = (filters: FilterState): boolean =>
  filters.levels.length === 0 &&
  filters.schools.length === 0 &&
  filters.classes.length === 0 &&
  filters.components.length === 0 &&
  filters.concentration === null &&
  filters.ritual === null &&
  filters.sources.length === 0 &&
  filters.search === "" &&
  filters.spellbooks.length === 0 &&
  filters.damageTypes.length === 0

export const readInitialFilters = (): FilterState => {
  const params = new URLSearchParams(window.location.search)
  if (params.size === 0) return emptyFilters
  return filtersFromSearchParams(params)
}

export const useSyncFiltersToURL = (filters: FilterState) => {
  const isFirstRender = useRef(true)

  const sync = useCallback((f: FilterState) => {
    const url = new URL(window.location.href)
    if (isEmptyFilters(f)) {
      if (url.search === "") return
      url.search = ""
    } else {
      const newSearch = filtersToSearchParams(f).toString()
      if (url.searchParams.toString() === newSearch) return
      url.search = newSearch
    }
    window.history.replaceState(null, "", url.toString())
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    sync(filters)
  }, [filters, sync])
}
