import type { Language } from "@/features/spells/data/types"
import type { Category, Item, ItemI18n, ItemRaw, Rarity } from "./types"
import { RARITY_ORDER } from "./types"
import raw from "../../../../data/items.json"
import en from "../../../../data/items.i18n.en.json"
import fr from "../../../../data/items.i18n.fr.json"

const rawMap = raw as Record<string, ItemRaw>
const i18nMap: Record<Language, Record<string, ItemI18n>> = {
  en: en as Record<string, ItemI18n>,
  fr: fr as Record<string, ItemI18n>,
}

const aggregateRarities = (m: ItemRaw): Rarity[] => {
  if (m.rarity !== "Varies") return [m.rarity]
  const set = new Set<Rarity>()
  for (const slug of m.variants) {
    const child = rawMap[slug]
    if (child && child.rarity !== "Varies") set.add(child.rarity)
  }
  return [...set].sort(
    (a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b)
  )
}

export const buildItemList = (lang: Language): Item[] => {
  const i18n = i18nMap[lang]
  return Object.entries(rawMap)
    .filter(([, m]) => !m.variant)
    .map(([slug, m]) => {
      const tr = i18n[slug] ?? { name: slug, desc: [] }
      const firstLine = tr.desc[0] ?? ""
      return {
        slug,
        category: m.category,
        rarities: aggregateRarities(m),
        variantSlugs: m.variants,
        requiresAttunement: /requires attunement/i.test(firstLine),
        name: tr.name,
        desc: tr.desc,
      }
    })
}

export const getItemI18n = (lang: Language, slug: string): ItemI18n | null =>
  i18nMap[lang][slug] ?? null

export const getItemRaw = (slug: string): ItemRaw | null => rawMap[slug] ?? null

export const allCategories: Category[] = [
  "Ammunition",
  "Armor",
  "Potion",
  "Ring",
  "Rod",
  "Scroll",
  "Staff",
  "Wand",
  "Weapon",
  "Wondrous Items",
]
