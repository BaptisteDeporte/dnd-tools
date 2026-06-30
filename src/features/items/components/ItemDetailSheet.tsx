import { useRef, useState } from "react"
import type { Language } from "@/features/spells/data/types"
import type { Item, Rarity } from "../data/types"
import { RARITY_ORDER } from "../data/types"
import { getItemI18n, getItemRaw } from "../data/items"
import { useLanguage } from "@/i18n/LanguageContext"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface ItemDetailSheetProps {
  item: Item | null
  onClose: () => void
  onSelectVariant: (item: Item) => void
}

const RARITY_BADGE_CLASS: Record<Rarity, string> = {
  Common: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  Uncommon: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Rare: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "Very Rare": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  Legendary: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Artifact: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
}

const buildVariantItem = (slug: string, lang: Language): Item | null => {
  const raw = getItemRaw(slug)
  const tr = getItemI18n(lang, slug)
  if (!raw || !tr) return null
  const rarities: Rarity[] =
    raw.rarity === "Varies" ? [] : [raw.rarity]
  return {
    slug,
    category: raw.category,
    rarities,
    variantSlugs: raw.variants,
    requiresAttunement: /requires attunement/i.test(tr.desc[0] ?? ""),
    name: tr.name,
    desc: tr.desc,
  }
}

export const ItemDetailSheet = ({
  item,
  onClose,
  onSelectVariant,
}: ItemDetailSheetProps) => {
  const { lang, t } = useLanguage()
  const prevSlugRef = useRef<string | undefined>(item?.slug)
  const [localLang, setLocalLang] = useState<Language>(lang)

  if (prevSlugRef.current !== item?.slug) {
    prevSlugRef.current = item?.slug
    setLocalLang(lang)
  }

  const itemI18n = item ? getItemI18n(localLang, item.slug) : null
  const body = itemI18n?.desc.slice(1).join("\n\n") ?? ""

  const sortedRarities = item
    ? [...item.rarities].sort(
        (a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b)
      )
    : []

  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
        {item && itemI18n && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{itemI18n.name}</SheetTitle>
              <SheetDescription>{itemI18n.desc[0]}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-wrap gap-1 px-4">
              <Badge variant="outline">
                {t(`category.${item.category}` as const)}
              </Badge>
              {sortedRarities.map((r) => (
                <Badge
                  key={r}
                  variant="secondary"
                  className={RARITY_BADGE_CLASS[r]}
                >
                  {t(`rarity.${r}` as const)}
                </Badge>
              ))}
              {item.requiresAttunement && (
                <Badge variant="outline">
                  ✦ {t("filter.attunement")}
                </Badge>
              )}
            </div>
            {body && (
              <div className="space-y-2 border-t px-4 pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("detail.description")}
                </h4>
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {body}
                </div>
              </div>
            )}
            {item.variantSlugs.length > 0 && (
              <div className="space-y-2 border-t px-4 pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("items.variants.title")}
                </h4>
                <ul className="space-y-1">
                  {item.variantSlugs.map((slug) => {
                    const v = buildVariantItem(slug, localLang)
                    if (!v) return null
                    return (
                      <li key={slug}>
                        <button
                          onClick={() => onSelectVariant(v)}
                          className="flex w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                        >
                          <span className="font-medium">{v.name}</span>
                          <span className="flex flex-wrap gap-1">
                            {v.rarities.map((r) => (
                              <Badge
                                key={r}
                                variant="secondary"
                                className={RARITY_BADGE_CLASS[r]}
                              >
                                {t(`rarity.${r}` as const)}
                              </Badge>
                            ))}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <div className="flex items-center justify-end border-t px-4 pt-4 pb-4">
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
