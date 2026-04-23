import { useState, useCallback } from "react"
import type { Grimoire } from "../data/types"

const STORAGE_KEY = "dnd-tools-grimoires"

const loadFromStorage = (): Grimoire[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Grimoire[]) : []
  } catch {
    return []
  }
}

export const useGrimoires = () => {
  const [grimoires, setGrimoires] = useState<Grimoire[]>(loadFromStorage)

  const persist = useCallback((updated: Grimoire[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setGrimoires(updated)
  }, [])

  const createGrimoire = useCallback(
    (name: string): Grimoire => {
      const now = Date.now()
      const grimoire: Grimoire = {
        id: crypto.randomUUID(),
        name: name.trim(),
        spellSlugs: [],
        createdAt: now,
        updatedAt: now,
      }
      const updated = [...grimoires, grimoire]
      persist(updated)
      return grimoire
    },
    [grimoires, persist]
  )

  const renameGrimoire = useCallback(
    (id: string, newName: string) => {
      persist(
        grimoires.map((g) =>
          g.id === id
            ? { ...g, name: newName.trim(), updatedAt: Date.now() }
            : g
        )
      )
    },
    [grimoires, persist]
  )

  const deleteGrimoire = useCallback(
    (id: string) => {
      persist(grimoires.filter((g) => g.id !== id))
    },
    [grimoires, persist]
  )

  const addSpell = useCallback(
    (grimoireId: string, spellSlug: string) => {
      persist(
        grimoires.map((g) =>
          g.id === grimoireId && !g.spellSlugs.includes(spellSlug)
            ? {
                ...g,
                spellSlugs: [...g.spellSlugs, spellSlug],
                updatedAt: Date.now(),
              }
            : g
        )
      )
    },
    [grimoires, persist]
  )

  const addSpells = useCallback(
    (grimoireId: string, spellSlugs: string[]) => {
      persist(
        grimoires.map((g) => {
          if (g.id !== grimoireId) return g
          const toAdd = spellSlugs.filter((s) => !g.spellSlugs.includes(s))
          if (toAdd.length === 0) return g
          return {
            ...g,
            spellSlugs: [...g.spellSlugs, ...toAdd],
            updatedAt: Date.now(),
          }
        })
      )
    },
    [grimoires, persist]
  )

  const removeSpell = useCallback(
    (grimoireId: string, spellSlug: string) => {
      persist(
        grimoires.map((g) =>
          g.id === grimoireId
            ? {
                ...g,
                spellSlugs: g.spellSlugs.filter((s) => s !== spellSlug),
                updatedAt: Date.now(),
              }
            : g
        )
      )
    },
    [grimoires, persist]
  )

  const isSpellIn = useCallback(
    (grimoireId: string, spellSlug: string): boolean =>
      grimoires.find((g) => g.id === grimoireId)?.spellSlugs.includes(spellSlug) ?? false,
    [grimoires]
  )

  const getGrimoiresContaining = useCallback(
    (spellSlug: string): Grimoire[] =>
      grimoires.filter((g) => g.spellSlugs.includes(spellSlug)),
    [grimoires]
  )

  return {
    grimoires,
    createGrimoire,
    renameGrimoire,
    deleteGrimoire,
    addSpell,
    addSpells,
    removeSpell,
    isSpellIn,
    getGrimoiresContaining,
  }
}

export type GrimoiresState = ReturnType<typeof useGrimoires>
