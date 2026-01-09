"use client"

import { cn } from "@/lib/utils"

interface BiasMeterProps {
  leftCount: number
  centerCount: number
  rightCount: number
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
}

export function BiasMeter({ leftCount, centerCount, rightCount, size = "md", showLabels = true }: BiasMeterProps) {
  const total = leftCount + centerCount + rightCount
  const leftPercent = total > 0 ? (leftCount / total) * 100 : 33.33
  const centerPercent = total > 0 ? (centerCount / total) * 100 : 33.33
  const rightPercent = total > 0 ? (rightCount / total) * 100 : 33.33

  const heightClass = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }[size]

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Left ({leftCount})</span>
          <span>Center ({centerCount})</span>
          <span>Right ({rightCount})</span>
        </div>
      )}
      <div className={cn("flex rounded-full overflow-hidden", heightClass)}>
        <div className="bg-blue-500 transition-all duration-300" style={{ width: `${leftPercent}%` }} />
        <div className="bg-gray-400 transition-all duration-300" style={{ width: `${centerPercent}%` }} />
        <div className="bg-red-500 transition-all duration-300" style={{ width: `${rightPercent}%` }} />
      </div>
    </div>
  )
}
