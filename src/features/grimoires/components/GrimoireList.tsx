import { useState, useRef, useEffect } from "react"
import type { Grimoire } from "../data/types"
import { useLanguage } from "@/i18n/LanguageContext"
import { Button } from "@/components/ui/button"
import { ImportExportButtons } from "./ImportExportButtons"

import type { GrimoiresExport } from "../data/schema"

interface GrimoireListProps {
  grimoires: Grimoire[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: (name: string) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onImport: (data: GrimoiresExport) => void
}

interface GrimoireItemProps {
  grimoire: Grimoire
  isSelected: boolean
  onSelect: () => void
  onRename: (newName: string) => void
  onDelete: () => void
  onDuplicate: () => void
}

const GrimoireItem = ({
  grimoire,
  isSelected,
  onSelect,
  onRename,
  onDelete,
  onDuplicate,
}: GrimoireItemProps) => {
  const { t } = useLanguage()
  const [isRenaming, setIsRenaming] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [nameValue, setNameValue] = useState(grimoire.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isRenaming])

  const handleRenameSubmit = () => {
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== grimoire.name) {
      onRename(trimmed)
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit()
    if (e.key === "Escape") {
      setNameValue(grimoire.name)
      setIsRenaming(false)
    }
  }

  return (
    <div
      onClick={() => !isRenaming && !isConfirmingDelete && onSelect()}
      className={`group relative cursor-pointer rounded-lg border p-3 transition-colors ${
        isSelected
          ? "border-primary/50 bg-primary/5"
          : "hover:bg-accent/50"
      }`}
    >
      {isRenaming ? (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            className="min-w-0 flex-1 rounded border bg-background px-2 py-0.5 text-sm outline-none ring-1 ring-primary"
          />
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              handleRenameSubmit()
            }}
            className="text-xs text-primary hover:underline"
          >
            {t("grimoire.save")}
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              setIsRenaming(false)
            }}
            className="text-xs text-muted-foreground hover:underline"
          >
            {t("grimoire.cancel")}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm font-medium ${isSelected ? "text-primary" : ""}`}
          >
            {grimoire.name}
          </span>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsConfirmingDelete(false)
                setNameValue(grimoire.name)
                setIsRenaming(true)
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              title={t("grimoire.rename")}
            >
              {/* Pencil icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate()
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              title={t("grimoire.duplicate")}
            >
              {/* Copy icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsConfirmingDelete(true)
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title={t("grimoire.delete")}
            >
              {/* Trash icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {!isRenaming && (
        <div className="mt-0.5 text-xs text-muted-foreground">
          {t("grimoire.spells.count", { count: grimoire.spellSlugs.length })}
        </div>
      )}

      {isConfirmingDelete && (
        <div
          className="mt-2 flex items-center gap-2 border-t pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-muted-foreground">
            {t("grimoire.delete.confirm")}
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete()}
          >
            {t("grimoire.delete")}
          </Button>
          <button
            onClick={() => setIsConfirmingDelete(false)}
            className="text-xs text-muted-foreground hover:underline"
          >
            {t("grimoire.cancel")}
          </button>
        </div>
      )}
    </div>
  )
}

interface CreateFormProps {
  onSubmit: (name: string) => void
  onCancel: () => void
}

const CreateForm = ({ onSubmit, onCancel }: CreateFormProps) => {
  const { t } = useLanguage()
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit()
          if (e.key === "Escape") onCancel()
        }}
        placeholder={t("grimoire.name.placeholder")}
        className="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-sm outline-none ring-1 ring-primary"
      />
      <Button size="sm" onClick={handleSubmit} disabled={!value.trim()}>
        {t("grimoire.create")}
      </Button>
      <button
        onClick={onCancel}
        className="text-xs text-muted-foreground hover:underline"
      >
        {t("grimoire.cancel")}
      </button>
    </div>
  )
}

export const GrimoireList = ({
  grimoires,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onDuplicate,
  onImport,
}: GrimoireListProps) => {
  const { t } = useLanguage()
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-1">
        <span className="shrink-0 whitespace-nowrap text-sm font-medium text-muted-foreground">
          {grimoires.length > 0
            ? `${grimoires.length} grimoire${grimoires.length > 1 ? "s" : ""}`
            : ""}
        </span>
        <div className="flex items-center gap-1">
          <ImportExportButtons
            grimoires={grimoires}
            onImport={onImport}
          />
          {!isCreating && (
            <Button size="sm" variant="outline" onClick={() => setIsCreating(true)}>
              + {t("grimoire.new")}
            </Button>
          )}
        </div>
      </div>

      {isCreating && (
        <CreateForm
          onSubmit={(name) => {
            onCreate(name)
            setIsCreating(false)
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <div className="flex flex-col gap-1.5">
        {grimoires.map((g) => (
          <GrimoireItem
            key={g.id}
            grimoire={g}
            isSelected={selectedId === g.id}
            onSelect={() => onSelect(g.id)}
            onRename={(name) => onRename(g.id, name)}
            onDelete={() => onDelete(g.id)}
            onDuplicate={() => onDuplicate(g.id)}
          />
        ))}
      </div>
    </div>
  )
}
