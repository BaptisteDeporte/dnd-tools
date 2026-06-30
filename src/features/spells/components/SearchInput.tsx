import { useEffect, useState } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import type { TranslationKey } from "@/i18n/translations"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholderKey?: TranslationKey
}

export const SearchInput = ({
  value,
  onChange,
  placeholderKey = "search.placeholder",
}: SearchInputProps) => {
  const { t } = useLanguage()
  const [local, setLocal] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => onChange(local), 200)
    return () => clearTimeout(timeout)
  }, [local, onChange])

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder={t(placeholderKey)}
      className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/50 placeholder:text-muted-foreground focus:ring-2 sm:w-64"
    />
  )
}
