import { useMemo, useState } from "react"
import type { Spell } from "@/features/spells/data/types"
import { buildSpellList } from "@/features/spells/data/spells"
import { useLanguage } from "@/i18n/LanguageContext"
import { useSpellbooksContext } from "./SpellbooksContext"
import { SpellbookList } from "./components/SpellbookList"
import { SpellbookDetail } from "./components/SpellbookDetail"
import { ImportExportButtons } from "./components/ImportExportButtons"
import { DuplicateSpellbookDialog } from "./components/DuplicateSpellbookDialog"
import { SpellDetailSheet } from "@/features/spells/components/SpellDetailSheet"
import { Button } from "@/components/ui/button"
import type { Spellbook } from "./data/types"

export const SpellbooksPage = () => {
  const { lang } = useLanguage()
  const {
    spellbooks,
    createSpellbook,
    duplicateSpellbook,
    renameSpellbook,
    deleteSpellbook,
    removeSpell,
    importSpellbooks,
    togglePrepared,
  } = useSpellbooksContext()

  const spells = useMemo(() => buildSpellList(lang), [lang])
  const spellsBySlug = useMemo(
    () => new Map<string, Spell>(spells.map((s) => [s.slug, s])),
    [spells]
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null)
  const [duplicatingSpellbook, setDuplicatingSpellbook] = useState<Spellbook | null>(null)

  const selectedSpellbook = spellbooks.find((g) => g.id === selectedId) ?? null

  const handleDelete = (id: string) => {
    deleteSpellbook(id)
    if (selectedId === id) setSelectedId(null)
  }

  const handleCreate = (name: string) => {
    const created = createSpellbook(name)
    setSelectedId(created.id)
  }

  if (spellbooks.length === 0) {
    return (
      <EmptyState
        onCreate={handleCreate}
        onImport={importSpellbooks}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        {/* Left — spellbook list */}
        <div className="flex flex-col gap-2">
          <SpellbookList
            spellbooks={spellbooks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={handleCreate}
            onRename={renameSpellbook}
            onDelete={handleDelete}
            onDuplicate={(id) => setDuplicatingSpellbook(spellbooks.find((g) => g.id === id) ?? null)}
            onImport={importSpellbooks}
          />
        </div>

        {/* Right — spellbook detail */}
        <SpellbookDetail
          spellbook={selectedSpellbook}
          spellsBySlug={spellsBySlug}
          onRemoveSpell={removeSpell}
          onSelectSpell={setSelectedSpell}
          onTogglePrepared={togglePrepared}
        />
      </div>

      <SpellDetailSheet
        spell={selectedSpell}
        onClose={() => setSelectedSpell(null)}
      />

      <DuplicateSpellbookDialog
        spellbook={duplicatingSpellbook}
        spellsBySlug={spellsBySlug}
        onConfirm={(name, spellSlugs) => {
          const created = duplicateSpellbook(duplicatingSpellbook!.id, name, spellSlugs)
          setSelectedId(created.id)
          setDuplicatingSpellbook(null)
        }}
        onClose={() => setDuplicatingSpellbook(null)}
      />
    </div>
  )
}

interface EmptyStateProps {
  onCreate: (name: string) => void
  onImport: (data: import("./data/schema").SpellbooksExport) => void
}

const EmptyState = ({ onCreate, onImport }: EmptyStateProps) => {
  const { t } = useLanguage()
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState("")

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (trimmed) {
      onCreate(trimmed)
      setName("")
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      {/* Book icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground/40"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
      <div>
        <p className="font-medium">{t("grimoire.empty")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("grimoire.empty.description")}
        </p>
      </div>

      {isCreating ? (
        <div className="flex w-full max-w-sm items-center gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit()
              if (e.key === "Escape") setIsCreating(false)
            }}
            placeholder={t("grimoire.name.placeholder")}
            className="min-w-0 flex-1 rounded border bg-background px-3 py-1.5 text-sm outline-none ring-1 ring-primary"
          />
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>
            {t("grimoire.create")}
          </Button>
          <button
            onClick={() => setIsCreating(false)}
            className="text-xs text-muted-foreground hover:underline"
          >
            {t("grimoire.cancel")}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreating(true)}>
            + {t("grimoire.new")}
          </Button>
          <ImportExportButtons
            spellbooks={[]}
            onImport={onImport}
          />
        </div>
      )}
    </div>
  )
}
