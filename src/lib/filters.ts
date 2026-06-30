export const matchesMultiSelect = <T,>(filter: T[], value: T): boolean =>
  filter.length === 0 || filter.includes(value)

export const matchesArrayAny = <T,>(filter: T[], values: T[]): boolean =>
  filter.length === 0 || filter.some((f) => values.includes(f))

export const matchesArrayAll = <T,>(filter: T[], values: T[]): boolean =>
  filter.length === 0 || filter.every((f) => values.includes(f))

export const matchesBoolFilter = (
  filter: boolean | null,
  value: boolean
): boolean => filter === null || filter === value
