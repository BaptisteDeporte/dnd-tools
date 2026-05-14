import type { Spellbook } from "../data/types"
import type { Spell, School } from "@/features/spells/data/types"
import { useLanguage } from "@/i18n/LanguageContext"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SpellbookDetailProps {
  spellbook: Spellbook | null
  spellsBySlug: Map<string, Spell>
  onRemoveSpell: (spellbookId: string, slug: string) => void
  onSelectSpell: (spell: Spell) => void
  onTogglePrepared: (spellbookId: string, slug: string) => void
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

export const SpellbookDetail = ({
  spellbook,
  spellsBySlug,
  onRemoveSpell,
  onSelectSpell,
  onTogglePrepared,
}: SpellbookDetailProps) => {
  const { t } = useLanguage()

  if (!spellbook) {
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

  const spells = spellbook.spellSlugs
    .map((slug) => spellsBySlug.get(slug))
    .filter((s): s is Spell => s !== undefined)
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{spellbook.name}</h3>
        <span className="text-sm text-muted-foreground">
          {t("grimoire.spells.count", { count: spells.length })}
        </span>
      </div>

      {spells.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <span className="text-sm text-muted-foreground">
            {t("grimoire.noSpells")}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {t("grimoire.noSpells.description")}
          </span>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">{t("grimoire.spell.prepared")}</TableHead>
                <TableHead className="w-16">{t("column.level")}</TableHead>
                <TableHead>{t("column.name")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("column.school")}</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {spells.map((spell) => {
                const isCantrip = spell.level === 0
                const isPrepared = isCantrip || spellbook.preparedSlugs.includes(spell.slug)
                return (
                  <TableRow key={spell.slug} className="group even:bg-muted/50">
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={isPrepared}
                        disabled={isCantrip}
                        onChange={() => onTogglePrepared(spellbook.id, spell.slug)}
                        className="cursor-pointer accent-primary disabled:cursor-default disabled:opacity-40"
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${LEVEL_COLORS[spell.level] ?? ""}`}
                      >
                        {isCantrip ? t("level.cantrip").slice(0, 3) : `N${spell.level}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => onSelectSpell(spell)}
                        className="text-left text-sm font-medium hover:text-primary hover:underline"
                      >
                        {spell.name}
                      </button>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">
                        {t(`school.${spell.school}` as `school.${School}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => onRemoveSpell(spellbook.id, spell.slug)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        title={t("grimoire.remove.spell")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
