import type { Spell, School, DndClass } from "../data/types"
import { useLanguage } from "@/i18n/LanguageContext"
import { useGrimoiresContext } from "@/features/grimoires/GrimoiresContext"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface SpellDetailSheetProps {
  spell: Spell | null
  onClose: () => void
}

const MetaRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="text-sm">{children}</span>
  </div>
)

const GrimoireInfo = ({ spell }: { spell: Spell }) => {
  const { t } = useLanguage()
  const { getGrimoiresContaining, removeSpell } = useGrimoiresContext()
  const containing = getGrimoiresContaining(spell.slug)

  if (containing.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 px-4">
      <span className="text-xs text-muted-foreground">
        {t("grimoire.filter.label")} :
      </span>
      {containing.map((g) => (
        <span
          key={g.id}
          className="group flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary"
        >
          {g.name}
          <button
            onClick={() => removeSpell(g.id, spell.slug)}
            className="ml-0.5 rounded-full text-primary/50 transition-colors hover:text-destructive"
            title={t("grimoire.remove.spell")}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

export const SpellDetailSheet = ({
  spell,
  onClose,
}: SpellDetailSheetProps) => {
  const { t } = useLanguage()

  return (
    <Sheet open={spell !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
        {spell && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{spell.name}</SheetTitle>
              <SheetDescription>
                {spell.level === 0
                  ? `${t(`school.${spell.school}` as `school.${School}`)} ${t("level.cantrip").toLowerCase()}`
                  : `${t(`school.${spell.school}` as `school.${School}`)} — ${t("column.level").toLowerCase()} ${spell.level}`}
              </SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 px-4">
              <MetaRow label={t("detail.castingTime")}>
                {spell.casting_time}
              </MetaRow>
              <MetaRow label={t("detail.range")}>{spell.range}</MetaRow>
              <MetaRow label={t("detail.duration")}>{spell.duration}</MetaRow>
              <MetaRow label={t("detail.components")}>
                {spell.components_detail}
              </MetaRow>
              {spell.concentration && (
                <MetaRow label={t("filter.concentration")}>✦</MetaRow>
              )}
              {spell.ritual && (
                <MetaRow label={t("filter.ritual")}>✦</MetaRow>
              )}
            </div>
            <div className="flex flex-wrap gap-1 px-4">
              {spell.classes.map((cls) => (
                <Badge key={cls} variant="secondary">
                  {t(`class.${cls}` as `class.${DndClass}`)}
                </Badge>
              ))}
            </div>
            <GrimoireInfo spell={spell} />
            {spell.description && (
              <div className="space-y-2 border-t px-4 pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("detail.description")}
                </h4>
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {spell.description}
                </div>
              </div>
            )}
            <div className="border-t px-4 pt-4 pb-4">
              <span className="text-xs text-muted-foreground">
                {spell.source}
              </span>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
