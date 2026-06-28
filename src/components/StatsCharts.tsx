import { useMemo, useState } from 'react'
import { smoothAreaPath, polylinePath } from '../lib/utils'

interface ChartData {
  date: string
  income: number
}

interface StatsChartsProps {
  data: ChartData[]
}

// SVG layout — same coordinate system as Home.tsx
const L = { left: 10, top: 4, right: 2, bottom: 10, width: 120, height: 40 }
const DX = L.left, DY = L.top
const DW = L.width - L.left - L.right   // 100
const DH = L.height - L.top - L.bottom  // 64
const DB = DY + DH                       // 70

function computeYTicks(maxValue: number) {
  const step = maxValue <= 1000 ? 200 : maxValue <= 5000 ? 500 : 2000
  const minAxis = Math.max(step * 3, 600)
  const maxAxis = Math.max(Math.ceil(maxValue / step) * step, minAxis)
  const ticks = []
  for (let v = 0; v <= maxAxis; v += step) {
    ticks.push({ value: v, y: DB - (v / maxAxis) * DH })
  }
  return { ticks, maxAxis }
}

export default function StatsCharts({ data }: StatsChartsProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; income: number; cx: number; cy: number } | null>(null)
  const maxIncome = useMemo(() => Math.max(...data.map(d => d.income), 1), [data])
  const { ticks: yTicks, maxAxis } = useMemo(() => computeYTicks(maxIncome), [maxIncome])
  const hasData = data.some(d => d.income > 0)
  const count = data.length

  if (count === 0) {
    return <p className="text-center text-muted-foreground py-8 text-sm">该周期暂无记录，去首页新增一条吧</p>
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${L.width} ${L.height}`} className="w-full" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="areaGradientStats" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Y-axis labels */}
        {yTicks.map(t => (
          <text key={t.value} x={DX - 2} y={t.y + 1.2} textAnchor="end" fontSize="3.5" fill="#a3a3a3">¥{t.value}</text>
        ))}

        {/* X-axis labels (间隔显示避免过密) */}
        {data.filter((_, i) => {
          const labelInterval = count > 15 ? Math.ceil(count / 6) : 1
          return i % labelInterval === 0 || i === count - 1
        }).map(d => {
          const i = data.indexOf(d)
          const margin = DW * 0.06
          const innerW = DW - 2 * margin
          const x = DX + margin + (i / (count - 1 || 1)) * innerW
          return (
            <text key={i} x={x} y={DB + 8} textAnchor="middle" fontSize="3" fill="#a3a3a3">{d.date}</text>
          )
        })}

        {/* Area chart */}
        {hasData ? (() => {
          const margin = DW * 0.06
          const innerW = DW - 2 * margin
          const points = data.map((d, i) => ({
            x: DX + margin + (i / (count - 1 || 1)) * innerW,
            y: DB - (d.income / maxAxis) * DH,
          }))
          const pathD = smoothAreaPath(points, DB)
          return (
            <>
              <path d={pathD} fill="url(#areaGradientStats)" />
              <path d={polylinePath(points)} fill="none" stroke="#3b82f6" strokeWidth="0.4" strokeLinejoin="round" strokeOpacity="0.7" />
              {/* Hover indicator */}
              {tooltip && (() => {
                const idx = data.findIndex(d => d.date === tooltip.date)
                const cx = DX + margin + (idx / (count - 1 || 1)) * innerW
                const cy = DB - (tooltip.income / maxAxis) * DH
                return (
                  <>
                    <line x1={cx} y1={DY} x2={cx} y2={DB} stroke="#3b82f6" strokeWidth="0.3" strokeDasharray="1.5,2.5" opacity="0.5" />
                    <circle cx={cx} cy={cy} r="1.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.4" />
                  </>
                )
              })()}
              {/* Hit targets for tooltip */}
              {data.map((d, i) => {
                const hitW = Math.max(DW / count, 3)
                const cx = DX + margin + (i / (count - 1 || 1)) * innerW
                return (
                  <rect
                    key={`hit-${i}`}
                    x={cx - hitW / 2} y={DY}
                    width={hitW} height={DH}
                    fill="transparent"
                    onMouseEnter={(e) => {
                      const svg = (e.currentTarget as SVGElement).closest('svg')!
                      const r = svg.getBoundingClientRect()
                      const scaleX = r.width / L.width
                      const cy = DB - (d.income / maxAxis) * DH
                      setTooltip({ x: r.left + cx * scaleX, y: r.top - 8, date: d.date, income: d.income, cx, cy })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </>
          )
        })() : (
          <text x={DX + DW / 2} y={DY + DH / 2} textAnchor="middle" fontSize="4" fill="#a3a3a3">该周期暂无记录</text>
        )}

        {/* Grid lines */}
        {hasData && yTicks.map(t => (
          <line key={`grid-${t.value}`} x1={DX} y1={t.y} x2={DX + DW} y2={t.y} stroke="#4b5563" strokeWidth="0.2" strokeDasharray="1.5,2.5" opacity="0.35" />
        ))}

        {/* Axis borders */}
        <line x1={DX} y1={DY} x2={DX} y2={DB} stroke="#e5e7eb" strokeWidth="0.3" />
        <line x1={DX} y1={DB} x2={DX + DW} y2={DB} stroke="#e5e7eb" strokeWidth="0.3" />
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.date} · ¥{tooltip.income.toFixed(0)}
        </div>
      )}
    </div>
  )
}
