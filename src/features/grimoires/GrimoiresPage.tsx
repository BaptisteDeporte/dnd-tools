import { useMemo, useState } from "react"
import type { Spell } from "@/features/spells/data/types"
import { buildSpellList } from "@/features/spells/data/spells"
import { useLanguage } from "@/i18n/LanguageContext"
import { useGrimoiresContext } from "./GrimoiresContext"
import { GrimoireList } from "./components/GrimoireList"
import { GrimoireDetail } from "./components/GrimoireDetail"
import { ImportExportButtons } from "./components/ImportExportButtons"
import { DuplicateGrimoireDialog } from "./components/DuplicateGrimoireDialog"
import { SpellDetailSheet } from "@/features/spells/components/SpellDetailSheet"
import { Button } from "@/components/ui/button"
import type { Grimoire } from "./data/types"

export const GrimoiresPage = () => {
  const { lang } = useLanguage()
  const {
    grimoires,
    createGrimoire,
    duplicateGrimoire,
    renameGrimoire,
    deleteGrimoire,
    removeSpell,
    importGrimoires,
    togglePrepared,
  } = useGrimoiresContext()

  const spells = useMemo(() => buildSpellList(lang), [lang])
  const spellsBySlug = useMemo(
    () => new Map<string, Spell>(spells.map((s) => [s.slug, s])),
    [spells]
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null)
  const [duplicatingGrimoire, setDuplicatingGrimoire] = useState<Grimoire | null>(null)

  const selectedGrimoire = grimoires.find((g) => g.id === selectedId) ?? null

  // If the selected grimoire was deleted, clear the selection
  const handleDelete = (id: string) => {
    deleteGrimoire(id)
    if (selectedId === id) setSelectedId(null)
  }

  const handleCreate = (name: string) => {
    const created = createGrimoire(name)
    setSelectedId(created.id)
  }

  if (grimoires.length === 0) {
    return (
      <EmptyState
        onCreate={handleCreate}
        onImport={importGrimoires}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        {/* Left — grimoire list */}
        <div className="flex flex-col gap-2">
          <GrimoireList
            grimoires={grimoires}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={handleCreate}
            onRename={renameGrimoire}
            onDelete={handleDelete}
            onDuplicate={(id) => setDuplicatingGrimoire(grimoires.find((g) => g.id === id) ?? null)}
            onImport={importGrimoires}
          />
        </div>

        {/* Right — grimoire detail */}
        <GrimoireDetail
          grimoire={selectedGrimoire}
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

      <DuplicateGrimoireDialog
        grimoire={duplicatingGrimoire}
        spellsBySlug={spellsBySlug}
        onConfirm={(name, spellSlugs) => {
          const created = duplicateGrimoire(duplicatingGrimoire!.id, name, spellSlugs)
          setSelectedId(created.id)
          setDuplicatingGrimoire(null)
        }}
        onClose={() => setDuplicatingGrimoire(null)}
      />
    </div>
  )
}

interface EmptyStateProps {
  onCreate: (name: string) => void
  onImport: (data: import("./data/schema").GrimoiresExport) => void
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
            grimoires={[]}
            onImport={onImport}
          />
        </div>
      )}
    </div>
  )
}
