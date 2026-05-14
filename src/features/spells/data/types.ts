export type DamageType =
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder"

export type School =
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy"
  | "transmutation"

export type DndClass =
  | "Artificer"
  | "Bard"
  | "Cleric"
  | "Druid"
  | "Paladin"
  | "Ranger"
  | "Sorcerer"
  | "Warlock"
  | "Wizard"

export type Component = "V" | "S" | "M"

export type Language = "en" | "fr"

export interface SpellMechanics {
  level: number
  school: School
  components: Component[]
  concentration: boolean
  ritual: boolean
  source: string
  classes: DndClass[]
  damage_types: DamageType[]
}

export interface SpellI18n {
  name: string
  description?: string
  casting_time: string
  range: string
  components_detail: string
  duration: string
}

export interface Spell extends SpellMechanics, SpellI18n {
  slug: string
}

export type SpellbookFilterMode = "exclude" | "include-all"

export interface FilterState {
  levels: number[]
  schools: School[]
  classes: DndClass[]
  components: Component[]
  concentration: boolean | null
  ritual: boolean | null
  sources: string[]
  search: string
  spellbooks: string[]
  spellbookMode: SpellbookFilterMode
  damageTypes: DamageType[]
}

export const emptyFilters: FilterState = {
  levels: [],
  schools: [],
  classes: [],
  components: [],
  concentration: null,
  ritual: null,
  sources: [],
  search: "",
  spellbooks: [],
  spellbookMode: "exclude",
  damageTypes: [],
}
