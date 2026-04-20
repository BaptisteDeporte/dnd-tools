interface TriStateToggleProps {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}

export const TriStateToggle = ({
  label,
  value,
  onChange,
}: TriStateToggleProps) => {
  const cycle = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }

  return (
    <button
      onClick={cycle}
      className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors hover:bg-accent ${
        value !== null
          ? "border-primary/50 bg-primary/5 text-foreground"
          : "text-muted-foreground"
      }`}
    >
      {label}
      {value !== null && (
        <span
          className={`text-xs font-medium ${value ? "text-green-600" : "text-red-500"}`}
        >
          {value ? "✓" : "✗"}
        </span>
      )}
    </button>
  )
}
