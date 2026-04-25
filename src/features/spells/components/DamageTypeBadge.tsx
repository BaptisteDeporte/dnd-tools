import type { DamageType } from "../data/types"
import { useLanguage } from "@/i18n/LanguageContext"

const DAMAGE_TYPE_CLASSES: Record<DamageType, string> = {
  acid:        "bg-lime-500/15 text-lime-700 dark:text-lime-400",
  bludgeoning: "bg-stone-400/20 text-stone-600 dark:text-stone-400",
  cold:        "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  fire:        "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  force:       "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  lightning:   "bg-yellow-400/20 text-yellow-700 dark:text-yellow-400",
  necrotic:    "bg-purple-600/15 text-purple-800 dark:text-purple-300",
  piercing:    "bg-slate-400/20 text-slate-600 dark:text-slate-400",
  poison:      "bg-green-600/15 text-green-800 dark:text-green-400",
  psychic:     "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  radiant:     "bg-amber-400/20 text-amber-700 dark:text-amber-400",
  slashing:    "bg-red-500/15 text-red-700 dark:text-red-400",
  thunder:     "bg-blue-500/15 text-blue-700 dark:text-blue-400",
}

interface DamageTypeBadgeProps {
  type: DamageType
}

export const DamageTypeBadge = ({ type }: DamageTypeBadgeProps) => {
  const { t } = useLanguage()
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${DAMAGE_TYPE_CLASSES[type]}`}
    >
      {t(`damageType.${type}` as `damageType.${DamageType}`)}
    </span>
  )
}

interface DamageTypeCellProps {
  types: DamageType[]
}

export const DamageTypeCell = ({ types }: DamageTypeCellProps) => {
  if (types.length === 0) return null
  return (
    <div className="flex flex-wrap gap-0.5">
      {types.map((type) => (
        <DamageTypeBadge key={type} type={type} />
      ))}
    </div>
  )
}
