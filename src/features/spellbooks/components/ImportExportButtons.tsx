import { useState, useRef, useEffect } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/i18n/LanguageContext"
import { SpellbooksExportSchema } from "../data/schema"
import type { SpellbooksExport } from "../data/schema"
import type { Spellbook } from "../data/types"
import { cn } from "@/lib/utils"

interface ImportExportButtonsProps {
  spellbooks: Spellbook[]
  onImport: (data: SpellbooksExport) => void
}

export const ImportExportButtons = ({ spellbooks, onImport }: ImportExportButtonsProps) => {
  const { t } = useLanguage()

  // ── Export dialog ─────────────────────────────────────────────────────────
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [exportCopied, setExportCopied] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const allSelected = spellbooks.length > 0 && selectedIds.size === spellbooks.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < spellbooks.length

  // Keep the "select all" checkbox indeterminate in sync
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  const openExportDialog = () => {
    // Pre-select all spellbooks when opening
    setSelectedIds(new Set(spellbooks.map((g) => g.id)))
    setExportCopied(false)
    setIsExportOpen(true)
  }

  const handleExportOpenChange = (open: boolean) => {
    setIsExportOpen(open)
    if (!open) setExportCopied(false)
  }

  const toggleAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(spellbooks.map((g) => g.id)),
    )
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopyExport = async () => {
    const selected = spellbooks.filter((g) => selectedIds.has(g.id))
    const json = JSON.stringify(selected, null, 2)
    try {
      await navigator.clipboard.writeText(json)
    } catch {
      const el = document.createElement("textarea")
      el.value = json
      el.style.cssText = "position:fixed;opacity:0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setExportCopied(true)
    setTimeout(() => {
      setIsExportOpen(false)
      setExportCopied(false)
    }, 1000)
  }

  // ── Import dialog ─────────────────────────────────────────────────────────
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [rawText, setRawText] = useState("")
  const [importError, setImportError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState<number | null>(null)

  const resetImport = () => {
    setRawText("")
    setImportError(null)
    setImportedCount(null)
  }

  const handleImportOpenChange = (open: boolean) => {
    setIsImportOpen(open)
    if (!open) resetImport()
  }

  const handleImport = () => {
    setImportError(null)
    setImportedCount(null)

    let parsed: unknown
    try {
      parsed = JSON.parse(rawText)
    } catch {
      setImportError(t("grimoire.import.error.json"))
      return
    }

    const result = SpellbooksExportSchema.safeParse(parsed)
    if (!result.success) {
      const issue = result.error.issues[0]
      const path = issue.path.length > 0 ? `[${issue.path.join(".")}] ` : ""
      setImportError(`${path}${issue.message}`)
      return
    }

    onImport(result.data)
    setImportedCount(result.data.length)
    setTimeout(() => {
      setIsImportOpen(false)
      resetImport()
    }, 1200)
  }

  // ── Shared popup classes ──────────────────────────────────────────────────
  const popupCls = cn(
    "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
    "flex flex-col gap-4 rounded-xl border bg-popover p-6 shadow-xl",
    "transition duration-150 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95",
  )
  const backdropCls =
    "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

  return (
    <>
      {/* ── Export button ─────────────────────────────────────────────────── */}
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={spellbooks.length === 0}
        onClick={openExportDialog}
        title={t("grimoire.export")}
        className="text-muted-foreground hover:text-foreground"
      >
        {/* Clipboard + arrow up (mirrors the import icon) */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z" />
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2" />
          <path d="M12 18v-6" />
          <path d="m9 15 3-3 3 3" />
        </svg>
        <span className="sr-only">{t("grimoire.export")}</span>
      </Button>

      {/* ── Export dialog ─────────────────────────────────────────────────── */}
      <Dialog.Root open={isExportOpen} onOpenChange={handleExportOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className={backdropCls} />
          <Dialog.Popup className={popupCls}>
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-base font-semibold">
                {t("grimoire.export.title")}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {t("grimoire.export.description")}
              </Dialog.Description>
            </div>

            {/* Spellbook list with checkboxes */}
            <div className="flex flex-col overflow-hidden rounded-lg border">
              {/* Select-all header */}
              <label className="flex cursor-pointer items-center gap-3 border-b bg-muted/40 px-3 py-2 text-sm font-medium hover:bg-muted/60">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-3.5 cursor-pointer accent-primary"
                />
                {t("grimoire.export.selectAll")}
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {t("grimoire.export.selectedCount", { count: selectedIds.size, total: spellbooks.length })}
                </span>
              </label>

              {/* Individual spellbooks */}
              <div className="max-h-56 overflow-y-auto">
                {spellbooks.map((g) => (
                  <label
                    key={g.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent/40 [&:not(:last-child)]:border-b"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(g.id)}
                      onChange={() => toggleOne(g.id)}
                      className="size-3.5 cursor-pointer accent-primary"
                    />
                    <span className="flex-1 truncate font-medium">{g.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {t("grimoire.spells.count", { count: g.spellSlugs.length })}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Dialog.Close
                render={<Button variant="outline" size="sm">{t("grimoire.cancel")}</Button>}
              />
              <Button
                size="sm"
                disabled={selectedIds.size === 0 || exportCopied}
                onClick={handleCopyExport}
                className={cn(exportCopied && "bg-green-600 hover:bg-green-600 dark:bg-green-700")}
              >
                {exportCopied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {t("grimoire.export.copied")}
                  </>
                ) : (
                  t("grimoire.export.copy", { count: selectedIds.size })
                )}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Import button ─────────────────────────────────────────────────── */}
      <Dialog.Root open={isImportOpen} onOpenChange={handleImportOpenChange}>
        <Dialog.Trigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              title={t("grimoire.import")}
              className="text-muted-foreground hover:text-foreground"
            />
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z" />
            <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2" />
            <path d="M12 12v6" />
            <path d="m15 15-3 3-3-3" />
          </svg>
          <span className="sr-only">{t("grimoire.import")}</span>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Backdrop className={backdropCls} />
          <Dialog.Popup className={popupCls}>
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-base font-semibold">
                {t("grimoire.import.title")}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {t("grimoire.import.description")}
              </Dialog.Description>
            </div>

            <textarea
              autoFocus
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value)
                setImportError(null)
                setImportedCount(null)
              }}
              placeholder={t("grimoire.import.placeholder")}
              spellCheck={false}
              className={cn(
                "h-52 w-full resize-none rounded-lg border bg-background px-3 py-2",
                "font-mono text-xs outline-none",
                "ring-1 ring-border focus:ring-primary",
                importError && "border-destructive ring-destructive",
              )}
            />

            {importError && (
              <p className="text-xs text-destructive">
                {t("grimoire.import.error.prefix")} {importError}
              </p>
            )}
            {importedCount !== null && (
              <p className="text-xs text-green-600 dark:text-green-400">
                {t("grimoire.import.success", { count: importedCount })}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Dialog.Close
                render={<Button variant="outline" size="sm">{t("grimoire.cancel")}</Button>}
              />
              <Button
                size="sm"
                onClick={handleImport}
                disabled={!rawText.trim() || importedCount !== null}
              >
                {t("grimoire.import.submit")}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
