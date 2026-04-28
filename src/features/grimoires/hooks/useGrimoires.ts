import { useState, useCallback } from "react"
import type { Grimoire } from "../data/types"
import type { GrimoiresExport } from "../data/schema"


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

  const duplicateGrimoire = useCallback(
    (_sourceId: string, name: string, spellSlugs: string[]): Grimoire => {
      const now = Date.now()
      const grimoire: Grimoire = {
        id: crypto.randomUUID(),
        name: name.trim(),
        spellSlugs,
        createdAt: now,
        updatedAt: now,
      }
      persist([...grimoires, grimoire])
      return grimoire
    },
    [grimoires, persist]
  )

  // Merge strategy: imported grimoires with an existing ID overwrite the local
  // one; brand-new IDs are appended.
  const importGrimoires = useCallback(
    (imported: GrimoiresExport) => {
      const merged = [...grimoires]
      for (const g of imported) {
        const idx = merged.findIndex((m) => m.id === g.id)
        if (idx !== -1) {
          merged[idx] = g
        } else {
          merged.push(g)
        }
      }
      persist(merged)
    },
    [grimoires, persist]
  )

  return {
    grimoires,
    createGrimoire,
    duplicateGrimoire,
    renameGrimoire,
    deleteGrimoire,
    addSpell,
    addSpells,
    removeSpell,
    isSpellIn,
    getGrimoiresContaining,
    importGrimoires,
  }
}

export type GrimoiresState = ReturnType<typeof useGrimoires>
