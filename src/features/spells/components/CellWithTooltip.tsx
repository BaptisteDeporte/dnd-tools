import type { ReactNode } from "react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

interface CellWithTooltipProps {
  children: ReactNode
  tooltip: string | undefined
  className?: string
}

export const CellWithTooltip = ({
  children,
  tooltip,
  className,
}: CellWithTooltipProps) => {
  if (!tooltip) return <>{children}</>

  return (
    <Tooltip>
      <TooltipTrigger className="text-left hover:underline hover:decoration-muted-foreground/40 hover:decoration-dotted hover:underline-offset-4">
        {children}
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        className={className}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
