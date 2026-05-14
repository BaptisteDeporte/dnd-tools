import { z } from "zod"

export const SpellbookSchema = z.object({
  id: z.string().uuid("Invalid spellbook id (expected UUID)"),
  name: z.string().min(1, "Name must not be empty"),
  spellSlugs: z.array(z.string(), { error: "spellSlugs must be an array of strings" }),
  preparedSlugs: z.array(z.string()).default([]),
  createdAt: z.number().int().positive("createdAt must be a positive integer timestamp"),
  updatedAt: z.number().int().positive("updatedAt must be a positive integer timestamp"),
})

export const SpellbooksExportSchema = z.array(SpellbookSchema, {
  error: "Expected an array of spellbooks",
})

export type SpellbooksExport = z.infer<typeof SpellbooksExportSchema>
