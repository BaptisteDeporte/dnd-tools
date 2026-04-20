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

export interface FilterState {
  levels: number[]
  schools: School[]
  classes: DndClass[]
  components: Component[]
  concentration: boolean | null
  ritual: boolean | null
  sources: string[]
  search: string
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
}
