const RANGE_ORDER: Record<string, number> = {
  self: 0,
  personnelle: 0,
  touch: 5,
  contact: 5,
  special: -1,
  spéciale: -1,
  sight: Infinity,
  "à vue": Infinity,
  unlimited: Infinity,
  illimitée: Infinity,
}

const DURATION_MULTIPLIERS: Record<string, number> = {
  round: 6,
  rounds: 6,
  minute: 60,
  minutes: 60,
  hour: 3600,
  hours: 3600,
  heure: 3600,
  heures: 3600,
  day: 86400,
  days: 86400,
  jour: 86400,
  jours: 86400,
}

const DURATION_SPECIAL: Record<string, number> = {
  instantaneous: 0,
  instantanée: 0,
  special: -1,
  spéciale: -1,
}

const extractNumber = (s: string): number => {
  const match = s.replace(",", ".").match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

export const parseRange = (raw: string): number => {
  const lower = raw.toLowerCase().trim()
  if (lower in RANGE_ORDER) return RANGE_ORDER[lower]

  const feet = lower.match(/([\d.]+)\s*(?:feet|foot|ft)/i)
  if (feet) return parseFloat(feet[1])

  const miles = lower.match(/([\d.]+)\s*mile/i)
  if (miles) return parseFloat(miles[1]) * 5280

  const meters = lower.replace(",", ".").match(/([\d.]+)\s*(?:m\b|mètre)/i)
  if (meters) return parseFloat(meters[1]) * 3.281

  const km = lower.replace(",", ".").match(/([\d.]+)\s*km/i)
  if (km) return parseFloat(km[1]) * 3281

  return extractNumber(lower)
}

export const parseDuration = (raw: string): number => {
  const lower = raw.toLowerCase().trim()

  if (lower.startsWith("until") || lower.startsWith("dissipation"))
    return 999_999

  for (const [key, val] of Object.entries(DURATION_SPECIAL)) {
    if (lower === key) return val
  }

  const cleaned = lower
    .replace(/^concentration,?\s*(up to\s*|jusqu'à\s*)?/i, "")
    .replace(/^up to\s*/i, "")
    .replace(/^jusqu'à\s*/i, "")
    .trim()

  const num = extractNumber(cleaned)

  for (const [unit, mult] of Object.entries(DURATION_MULTIPLIERS)) {
    if (cleaned.includes(unit)) return num * mult
  }

  return num
}
