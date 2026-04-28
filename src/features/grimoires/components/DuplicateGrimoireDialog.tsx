import { useState, useRef, useEffect } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/i18n/LanguageContext"
import type { Grimoire } from "../data/types"
import type { Spell } from "@/features/spells/data/types"
import { cn } from "@/lib/utils"

interface DuplicateGrimoireDialogProps {
  grimoire: Grimoire | null
  spellsBySlug: Map<string, Spell>
  onConfirm: (name: string, spellSlugs: string[]) => void
  onClose: () => void
}

export const DuplicateGrimoireDialog = ({
  grimoire,
  spellsBySlug,
  onConfirm,
  onClose,
}: DuplicateGrimoireDialogProps) => {
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const spells = grimoire
    ? (grimoire.spellSlugs
        .map((slug) => spellsBySlug.get(slug))
        .filter(Boolean) as Spell[])
        .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
    : []

  useEffect(() => {
    if (grimoire) {
      setName(`${grimoire.name} - clone`)
      setSelectedSlugs(new Set(grimoire.spellSlugs))
    }
  }, [grimoire])

  const allSelected = spells.length > 0 && selectedSlugs.size === spells.length
  const someSelected = selectedSlugs.size > 0 && selectedSlugs.size < spells.length

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  const toggleAll = () => {
    setSelectedSlugs(allSelected ? new Set() : new Set(spells.map((s) => s.slug)))
  }

  const toggleOne = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const handleConfirm = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed, [...selectedSlugs])
  }

  const popupCls = cn(
    "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
    "flex flex-col gap-4 rounded-xl border bg-popover p-6 shadow-xl",
    "transition duration-150 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95",
  )
  const backdropCls =
    "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

  return (
    <Dialog.Root open={grimoire !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={backdropCls} />
        <Dialog.Popup className={popupCls}>
          <Dialog.Title className="text-base font-semibold">
            {t("grimoire.duplicate.title")}
          </Dialog.Title>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t("grimoire.duplicate.name.label")}</label>
            <input
              ref={inputRef}
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) handleConfirm()
                if (e.key === "Escape") onClose()
              }}
              className="rounded border bg-background px-3 py-1.5 text-sm outline-none ring-1 ring-primary"
            />
          </div>

          {spells.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                {t("grimoire.duplicate.spells.label")}
              </label>
              <div className="flex flex-col overflow-hidden rounded-lg border">
                <label className="flex cursor-pointer items-center gap-3 border-b bg-muted/40 px-3 py-2 text-sm font-medium hover:bg-muted/60">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="size-3.5 cursor-pointer accent-primary"
                  />
                  {t("grimoire.duplicate.selectAll")}
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    {t("grimoire.export.selectedCount", {
                      count: selectedSlugs.size,
                      total: spells.length,
                    })}
                  </span>
                </label>
                <div className="max-h-56 overflow-y-auto">
                  {spells.map((spell) => (
                    <label
                      key={spell.slug}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent/40 [&:not(:last-child)]:border-b"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSlugs.has(spell.slug)}
                        onChange={() => toggleOne(spell.slug)}
                        className="size-3.5 cursor-pointer accent-primary"
                      />
                      <span className="flex-1 truncate">{spell.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {spell.level === 0 ? t("level.cantrip") : `${spell.level}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button variant="outline" size="sm">
                  {t("grimoire.cancel")}
                </Button>
              }
            />
            <Button size="sm" disabled={!name.trim()} onClick={handleConfirm}>
              {t("grimoire.duplicate.confirm")}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
