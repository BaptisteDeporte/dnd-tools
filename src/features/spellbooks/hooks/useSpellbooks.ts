import { useState } from "react"
import type { Spellbook } from "../data/types"
import type { SpellbooksExport } from "../data/schema"


const STORAGE_KEY = "dnd-tools-spellbooks"

const loadFromStorage = (): Spellbook[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Omit<Spellbook, "preparedSlugs"> & { preparedSlugs?: string[] }>
    return parsed.map((g) => ({ ...g, preparedSlugs: g.preparedSlugs ?? [] }))
  } catch {
    return []
  }
}

export const useSpellbooks = () => {
  const [spellbooks, setSpellbooks] = useState<Spellbook[]>(loadFromStorage)

  const persist = (updated: Spellbook[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setSpellbooks(updated)
  }

  const createSpellbook = (name: string): Spellbook => {
    const now = Date.now()
    const spellbook: Spellbook = {
      id: crypto.randomUUID(),
      name: name.trim(),
      spellSlugs: [],
      preparedSlugs: [],
      createdAt: now,
      updatedAt: now,
    }
    const updated = [...spellbooks, spellbook]
    persist(updated)
    return spellbook
  }

  const renameSpellbook = (id: string, newName: string) => {
    persist(
      spellbooks.map((g) =>
        g.id === id
          ? { ...g, name: newName.trim(), updatedAt: Date.now() }
          : g
      )
    )
  }

  const deleteSpellbook = (id: string) => {
    persist(spellbooks.filter((g) => g.id !== id))
  }

  const addSpell = (spellbookId: string, spellSlug: string) => {
    persist(
      spellbooks.map((g) =>
        g.id === spellbookId && !g.spellSlugs.includes(spellSlug)
          ? {
              ...g,
              spellSlugs: [...g.spellSlugs, spellSlug],
              updatedAt: Date.now(),
            }
          : g
      )
    )
  }

  const addSpells = (spellbookId: string, spellSlugs: string[]) => {
    persist(
      spellbooks.map((g) => {
        if (g.id !== spellbookId) return g
        const toAdd = spellSlugs.filter((s) => !g.spellSlugs.includes(s))
        if (toAdd.length === 0) return g
        return {
          ...g,
          spellSlugs: [...g.spellSlugs, ...toAdd],
          updatedAt: Date.now(),
        }
      })
    )
  }

  const removeSpell = (spellbookId: string, spellSlug: string) => {
    persist(
      spellbooks.map((g) =>
        g.id === spellbookId
          ? {
              ...g,
              spellSlugs: g.spellSlugs.filter((s) => s !== spellSlug),
              updatedAt: Date.now(),
            }
          : g
      )
    )
  }

  const isSpellIn = (spellbookId: string, spellSlug: string): boolean =>
    spellbooks.find((g) => g.id === spellbookId)?.spellSlugs.includes(spellSlug) ?? false

  const getSpellbooksContaining = (spellSlug: string): Spellbook[] =>
    spellbooks.filter((g) => g.spellSlugs.includes(spellSlug))

  const duplicateSpellbook = (sourceId: string, name: string, spellSlugs: string[]): Spellbook => {
    const source = spellbooks.find((g) => g.id === sourceId)
    const now = Date.now()
    const spellbook: Spellbook = {
      id: crypto.randomUUID(),
      name: name.trim(),
      spellSlugs,
      preparedSlugs: source ? source.preparedSlugs.filter((s) => spellSlugs.includes(s)) : [],
      createdAt: now,
      updatedAt: now,
    }
    persist([...spellbooks, spellbook])
    return spellbook
  }

  const togglePrepared = (spellbookId: string, spellSlug: string) => {
    persist(
      spellbooks.map((g) => {
        if (g.id !== spellbookId) return g
        const isPrepared = g.preparedSlugs.includes(spellSlug)
        return {
          ...g,
          preparedSlugs: isPrepared
            ? g.preparedSlugs.filter((s) => s !== spellSlug)
            : [...g.preparedSlugs, spellSlug],
          updatedAt: Date.now(),
        }
      })
    )
  }

  // Merge strategy: imported spellbooks with an existing ID overwrite the local
  // one; brand-new IDs are appended.
  const importSpellbooks = (imported: SpellbooksExport) => {
    const merged = [...spellbooks]
    for (const g of imported) {
      const idx = merged.findIndex((m) => m.id === g.id)
      if (idx !== -1) {
        merged[idx] = g
      } else {
        merged.push(g)
      }
    }
    persist(merged)
  }

  return {
    spellbooks,
    createSpellbook,
    duplicateSpellbook,
    renameSpellbook,
    deleteSpellbook,
    addSpell,
    addSpells,
    removeSpell,
    isSpellIn,
    getSpellbooksContaining,
    importSpellbooks,
    togglePrepared,
  }
}

export type SpellbooksState = ReturnType<typeof useSpellbooks>
