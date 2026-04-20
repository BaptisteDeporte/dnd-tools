import type { Language, Spell, SpellI18n, SpellMechanics } from "./types"
import mechanics from "../../../../data/spells.json"
import en from "../../../../data/spells.i18n.en.json"
import fr from "../../../../data/spells.i18n.fr.json"

const i18nMap: Record<Language, Record<string, SpellI18n>> = { en, fr }

export const buildSpellList = (lang: Language): Spell[] =>
  Object.entries(mechanics as Record<string, SpellMechanics>).map(
    ([slug, mech]) => ({
      slug,
      ...mech,
      ...i18nMap[lang][slug],
    })
  )

export const allSources = [
  ...new Set(
    Object.values(mechanics as Record<string, SpellMechanics>).map(
      (s) => s.source
    )
  ),
].sort()
