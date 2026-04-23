import { createContext, use } from "react"
import type { ReactNode } from "react"
import { useGrimoires, type GrimoiresState } from "./hooks/useGrimoires"

const GrimoiresContext = createContext<GrimoiresState | null>(null)

export const GrimoiresProvider = ({ children }: { children: ReactNode }) => {
  const state = useGrimoires()
  return <GrimoiresContext value={state}>{children}</GrimoiresContext>
}

export const useGrimoiresContext = (): GrimoiresState => {
  const ctx = use(GrimoiresContext)
  if (!ctx) throw new Error("useGrimoiresContext must be used within GrimoiresProvider")
  return ctx
}
