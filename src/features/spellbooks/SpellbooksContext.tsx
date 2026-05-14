import { createContext, use } from "react"
import type { ReactNode } from "react"
import { useSpellbooks, type SpellbooksState } from "./hooks/useSpellbooks"

const SpellbooksContext = createContext<SpellbooksState | null>(null)

export const SpellbooksProvider = ({ children }: { children: ReactNode }) => {
  const state = useSpellbooks()
  return <SpellbooksContext value={state}>{children}</SpellbooksContext>
}

export const useSpellbooksContext = (): SpellbooksState => {
  const ctx = use(SpellbooksContext)
  if (!ctx) throw new Error("useSpellbooksContext must be used within SpellbooksProvider")
  return ctx
}
