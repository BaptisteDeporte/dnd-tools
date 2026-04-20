import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/i18n/LanguageContext"

interface MultiSelectProps<T extends string | number> {
  label: string
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (selected: T[]) => void
}

export const MultiSelect = <T extends string | number>({
  label,
  options,
  selected,
  onChange,
}: MultiSelectProps<T>) => {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const toggle = (value: T) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors hover:bg-accent ${
          selected.length > 0
            ? "border-primary/50 bg-primary/5 text-foreground"
            : "text-muted-foreground"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
            {selected.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 min-w-48 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
          <label className="flex cursor-pointer items-center gap-2 rounded-sm border-b px-2 py-1.5 text-sm font-medium hover:bg-accent">
            <input
              type="checkbox"
              checked={selected.length === options.length}
              ref={(el) => {
                if (el) el.indeterminate = selected.length > 0 && selected.length < options.length
              }}
              onChange={() =>
                onChange(selected.length === options.length ? [] : options.map((o) => o.value))
              }
              className="rounded border-input"
            />
            {t("all")}
          </label>
          {options.map((opt) => (
            <label
              key={String(opt.value)}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="rounded border-input"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
