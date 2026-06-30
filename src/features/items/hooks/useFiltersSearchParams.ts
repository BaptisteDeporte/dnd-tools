import { useEffect, useRef } from "react"
import type { Category, FilterState, Rarity } from "../data/types"
import { emptyFilters, RARITY_ORDER } from "../data/types"
import { allCategories } from "../data/items"

const parseList = <T extends string>(
  raw: string | null,
  allowed: readonly T[]
): T[] => {
  if (!raw) return []
  return raw.split(",").filter((v): v is T => allowed.includes(v as T))
}

const parseBool = (raw: string | null): boolean | null => {
  if (raw === "1") return true
  if (raw === "0") return false
  return null
}

export const filtersFromSearchParams = (
  params: URLSearchParams
): FilterState => ({
  categories: parseList<Category>(params.get("cats"), allCategories),
  rarities: parseList<Rarity>(params.get("rar"), RARITY_ORDER),
  attunement: parseBool(params.get("att")),
  search: params.get("q") ?? "",
})

export const filtersToSearchParams = (
  filters: FilterState
): URLSearchParams => {
  const params = new URLSearchParams()
  if (filters.categories.length > 0)
    params.set("cats", filters.categories.join(","))
  if (filters.rarities.length > 0) params.set("rar", filters.rarities.join(","))
  if (filters.attunement !== null)
    params.set("att", filters.attunement ? "1" : "0")
  if (filters.search) params.set("q", filters.search)
  return params
}

const isEmptyFilters = (filters: FilterState): boolean =>
  filters.categories.length === 0 &&
  filters.rarities.length === 0 &&
  filters.attunement === null &&
  filters.search === ""

export const readInitialFilters = (): FilterState => {
  const params = new URLSearchParams(window.location.search)
  if (params.size === 0) return emptyFilters
  return filtersFromSearchParams(params)
}

export const useSyncFiltersToURL = (filters: FilterState) => {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const url = new URL(window.location.href)
    if (isEmptyFilters(filters)) {
      if (url.search === "") return
      url.search = ""
    } else {
      const newSearch = filtersToSearchParams(filters).toString()
      if (url.searchParams.toString() === newSearch) return
      url.search = newSearch
    }
    window.history.replaceState(null, "", url.toString())
  }, [filters])
}
