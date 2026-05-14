import { useRef, useState } from "react"
import type { Language, Spell, School, DndClass, SpellI18n } from "../data/types"
import { useLanguage } from "@/i18n/LanguageContext"
import { useSpellbooksContext } from "@/features/spellbooks/SpellbooksContext"
import { Badge } from "@/components/ui/badge"
import { DamageTypeBadge } from "./DamageTypeBadge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import enI18n from "../../../../data/spells.i18n.en.json"
import frI18n from "../../../../data/spells.i18n.fr.json"

const i18nMap: Record<Language, Record<string, SpellI18n>> = {
  en: enI18n as Record<string, SpellI18n>,
  fr: frI18n as Record<string, SpellI18n>,
}

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

const SpellbookInfo = ({ spell }: { spell: Spell }) => {
  const { t } = useLanguage()
  const { getSpellbooksContaining, removeSpell } = useSpellbooksContext()
  const containing = getSpellbooksContaining(spell.slug)

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
  const { lang, t } = useLanguage()
  const prevSlugRef = useRef<string | undefined>(spell?.slug)
  const [localLang, setLocalLang] = useState<Language>(lang)

  if (prevSlugRef.current !== spell?.slug) {
    prevSlugRef.current = spell?.slug
    setLocalLang(lang)
  }

  const spellI18n = spell ? i18nMap[localLang][spell.slug] : null

  return (
    <Sheet open={spell !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
        {spell && spellI18n && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{spellI18n.name}</SheetTitle>
              <SheetDescription>
                {spell.level === 0
                  ? `${t(`school.${spell.school}` as `school.${School}`)} ${t("level.cantrip").toLowerCase()}`
                  : `${t(`school.${spell.school}` as `school.${School}`)} — ${t("column.level").toLowerCase()} ${spell.level}`}
              </SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 px-4">
              <MetaRow label={t("detail.castingTime")}>
                {spellI18n.casting_time}
              </MetaRow>
              <MetaRow label={t("detail.range")}>{spellI18n.range}</MetaRow>
              <MetaRow label={t("detail.duration")}>{spellI18n.duration}</MetaRow>
              <MetaRow label={t("detail.components")}>
                {spellI18n.components_detail}
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
            {spell.damage_types.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 px-4">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("filter.damageType")} :
                </span>
                {spell.damage_types.map((dt) => (
                  <DamageTypeBadge key={dt} type={dt} />
                ))}
              </div>
            )}
            <SpellbookInfo spell={spell} />
            {spellI18n.description && (
              <div className="space-y-2 border-t px-4 pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("detail.description")}
                </h4>
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {spellI18n.description}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between border-t px-4 pt-4 pb-4">
              <span className="text-xs text-muted-foreground">{spell.source}</span>
              <div className="flex items-center gap-0.5 rounded-md border bg-muted p-0.5">
                {(["fr", "en"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocalLang(l)}
                    className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                      localLang === l
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
