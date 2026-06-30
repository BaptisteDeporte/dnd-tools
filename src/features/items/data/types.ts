export type Category =
  | "Ammunition"
  | "Armor"
  | "Potion"
  | "Ring"
  | "Rod"
  | "Scroll"
  | "Staff"
  | "Wand"
  | "Weapon"
  | "Wondrous Items"

export type Rarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Very Rare"
  | "Legendary"
  | "Artifact"

export const RARITY_ORDER: Rarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
]

export interface ItemRaw {
  category: Category
  rarity: Rarity | "Varies"
  variant: boolean
  variants: string[]
}

export interface ItemI18n {
  name: string
  desc: string[]
}

export interface Item {
  slug: string
  category: Category
  rarities: Rarity[]
  variantSlugs: string[]
  requiresAttunement: boolean
  name: string
  desc: string[]
}

export interface FilterState {
  categories: Category[]
  rarities: Rarity[]
  attunement: boolean | null
  search: string
}

export const emptyFilters: FilterState = {
  categories: [],
  rarities: [],
  attunement: null,
  search: "",
}
