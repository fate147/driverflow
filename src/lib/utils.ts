import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 生成面积图的 SVG path（直连线段 + 闭合底部，干净不过冲） */
export function smoothAreaPath(
  points: { x: number; y: number }[],
  bottomY: number,
): string {
  return polylinePath(points) + ` L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`
}

/** 生成折线的 SVG path（仅线段，不闭合） */
export function polylinePath(points: { x: number; y: number }[]): string {
  const n = points.length
  if (n === 0) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < n; i++) {
    d += ` L ${points[i].x} ${points[i].y}`
  }
  return d
}
