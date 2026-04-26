import { z } from "zod"

export const GrimoireSchema = z.object({
  id: z.string().uuid("Invalid grimoire id (expected UUID)"),
  name: z.string().min(1, "Name must not be empty"),
  spellSlugs: z.array(z.string(), { error: "spellSlugs must be an array of strings" }),
  createdAt: z.number().int().positive("createdAt must be a positive integer timestamp"),
  updatedAt: z.number().int().positive("updatedAt must be a positive integer timestamp"),
})

export const GrimoiresExportSchema = z.array(GrimoireSchema, {
  error: "Expected an array of grimoires",
})

export type GrimoiresExport = z.infer<typeof GrimoiresExportSchema>
