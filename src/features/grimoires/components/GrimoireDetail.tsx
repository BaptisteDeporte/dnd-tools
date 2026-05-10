import type { Grimoire } from "../data/types"
import type { Spell, School } from "@/features/spells/data/types"
import { useLanguage } from "@/i18n/LanguageContext"
import { Badge } from "@/components/ui/badge"

interface GrimoireDetailProps {
  grimoire: Grimoire | null
  spellsBySlug: Map<string, Spell>
  onRemoveSpell: (grimoireId: string, slug: string) => void
  onSelectSpell: (spell: Spell) => void
  onTogglePrepared: (grimoireId: string, slug: string) => void
}

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  1: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  2: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  3: "bg-green-500/10 text-green-700 dark:text-green-300",
  4: "bg-green-500/10 text-green-700 dark:text-green-300",
  5: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  6: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  7: "bg-red-500/10 text-red-700 dark:text-red-300",
  8: "bg-red-500/10 text-red-700 dark:text-red-300",
  9: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

export const GrimoireDetail = ({
  grimoire,
  spellsBySlug,
  onRemoveSpell,
  onSelectSpell,
  onTogglePrepared,
}: GrimoireDetailProps) => {
  const { t } = useLanguage()

  if (!grimoire) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <span className="text-sm font-medium text-muted-foreground">
          {t("grimoire.detail.empty")}
        </span>
        <span className="text-xs text-muted-foreground/70">
          {t("grimoire.detail.empty.description")}
        </span>
      </div>
    )
  }

  const spells = grimoire.spellSlugs
    .map((slug) => spellsBySlug.get(slug))
    .filter((s): s is Spell => s !== undefined)
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))

  if (spells.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{grimoire.name}</h3>
          <span className="text-sm text-muted-foreground">
            {t("grimoire.spells.count", { count: 0 })}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <span className="text-sm text-muted-foreground">
            {t("grimoire.noSpells")}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {t("grimoire.noSpells.description")}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{grimoire.name}</h3>
        <span className="text-sm text-muted-foreground">
          {t("grimoire.spells.count", { count: spells.length })}
        </span>
      </div>

      <div className="flex flex-col divide-y rounded-lg border">
        {spells.map((spell) => {
          const isCantrip = spell.level === 0
          const isPrepared = isCantrip || grimoire.preparedSlugs.includes(spell.slug)
          return (
            <div
              key={spell.slug}
              className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/40"
            >
              {/* Level badge */}
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${LEVEL_COLORS[spell.level] ?? ""}`}
              >
                {isCantrip ? t("level.cantrip").slice(0, 3) : `N${spell.level}`}
              </span>

              {/* Name (clickable) */}
              <button
                onClick={() => onSelectSpell(spell)}
                className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:text-primary hover:underline"
              >
                {spell.name}
              </button>

              {/* School */}
              <Badge variant="secondary" className="hidden shrink-0 sm:flex">
                {t(`school.${spell.school}` as `school.${School}`)}
              </Badge>

              {/* Prepared checkbox */}
              <input
                type="checkbox"
                checked={isPrepared}
                disabled={isCantrip}
                onChange={() => onTogglePrepared(grimoire.id, spell.slug)}
                title={t("grimoire.spell.prepared")}
                className="shrink-0 cursor-pointer accent-primary disabled:cursor-default disabled:opacity-50"
              />

              {/* Remove button */}
              <button
                onClick={() => onRemoveSpell(grimoire.id, spell.slug)}
                className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                title={t("grimoire.remove.spell")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
