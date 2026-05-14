import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { useSpellbooksContext } from "@/features/spellbooks/SpellbooksContext"
import { Button } from "@/components/ui/button"

interface SpellSelectionBarProps {
  selectedSlugs: string[]
  onClear: () => void
}

export const SpellSelectionBar = ({
  selectedSlugs,
  onClear,
}: SpellSelectionBarProps) => {
  const { t } = useLanguage()
  const { spellbooks, addSpells, createSpellbook } = useSpellbooksContext()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const newNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creatingNew) newNameInputRef.current?.focus()
  }, [creatingNew])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setCreatingNew(false)
        setNewName("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  if (selectedSlugs.length === 0) return null

  const handleAddToSpellbook = (spellbookId: string) => {
    addSpells(spellbookId, selectedSlugs)
    setDropdownOpen(false)
    onClear()
  }

  const handleCreateAndAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const created = createSpellbook(trimmed)
    addSpells(created.id, selectedSlugs)
    setDropdownOpen(false)
    setCreatingNew(false)
    setNewName("")
    onClear()
  }

  const count = selectedSlugs.length

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2.5 shadow-lg ring-1 ring-black/5">
        {/* Count */}
        <span className="text-sm font-medium tabular-nums">
          {count} sort{count > 1 ? "s" : ""}
        </span>

        <span className="h-4 w-px bg-border" />

        {/* Add to spellbook dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            size="sm"
            variant="default"
            onClick={() => setDropdownOpen((o) => !o)}
          >
            {t("grimoire.add.spell")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`ml-1 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>

          {dropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 min-w-48 rounded-lg border bg-popover p-1 shadow-md">
              {spellbooks.length > 0 && (
                <>
                  {spellbooks.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleAddToSpellbook(g.id)}
                      className="flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      <span className="truncate">{g.name}</span>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                        {g.spellSlugs.length}
                      </span>
                    </button>
                  ))}
                  <div className="my-1 border-t" />
                </>
              )}

              {creatingNew ? (
                <div className="flex items-center gap-1 px-2 py-1">
                  <input
                    ref={newNameInputRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateAndAdd()
                      if (e.key === "Escape") {
                        setCreatingNew(false)
                        setNewName("")
                      }
                    }}
                    placeholder={t("grimoire.name.placeholder")}
                    className="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-xs outline-none ring-1 ring-primary"
                  />
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newName.trim()}
                    className="shrink-0 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-40"
                  >
                    {t("grimoire.create")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreatingNew(true)}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <span>+</span>
                  <span>{t("grimoire.new")}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Clear */}
        <button
          onClick={onClear}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Désélectionner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
