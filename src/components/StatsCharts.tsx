import { useMemo, useState } from 'react'
import { smoothAreaPath, polylinePath } from '../lib/utils'

interface ChartData {
  date: string
  income: number
}

interface StatsChartsProps {
  data: ChartData[]
}

const L = { left: 10, top: 4, right: 2, bottom: 10, width: 120, height: 40 }
const DX = L.left, DY = L.top
const DW = L.width - L.left - L.right
const DH = L.height - L.top - L.bottom
const DB = DY + DH

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
    return (
      <p style={{
        textAlign: 'center',
        color: 'var(--c-text-secondary)',
        padding: 'var(--space-8) 0',
        fontSize: 'var(--font-size-sm)',
        margin: 0,
      }}>该周期暂无记录，去首页新增一条吧</p>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${L.width} ${L.height}`} style={{ width: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="areaGradientStats" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--c-primary)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {yTicks.map(t => (
          <text key={t.value} x={DX - 2} y={t.y + 1.2} textAnchor="end" fontSize="3.5" style={{ fill: 'var(--c-text-muted)' }}>¥{t.value}</text>
        ))}

        {data.filter((_, i) => {
          const labelInterval = count > 15 ? Math.ceil(count / 6) : 1
          return i % labelInterval === 0 || i === count - 1
        }).map(d => {
          const i = data.indexOf(d)
          const margin = DW * 0.06
          const innerW = DW - 2 * margin
          const x = DX + margin + (i / (count - 1 || 1)) * innerW
          return (
            <text key={i} x={x} y={DB + 8} textAnchor="middle" fontSize="3" style={{ fill: 'var(--c-text-muted)' }}>{d.date}</text>
          )
        })}

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
              <path d={polylinePath(points)} fill="none" style={{ stroke: 'var(--c-primary)' }} strokeWidth="0.4" strokeLinejoin="round" strokeOpacity="0.7" />
              {tooltip && (() => {
                const idx = data.findIndex(d => d.date === tooltip.date)
                const cx = DX + margin + (idx / (count - 1 || 1)) * innerW
                const cy = DB - (tooltip.income / maxAxis) * DH
                return (
                  <>
                    <line x1={cx} y1={DY} x2={cx} y2={DB} style={{ stroke: 'var(--c-primary)' }} strokeWidth="0.3" strokeDasharray="1.5,2.5" opacity="0.5" />
                    <circle cx={cx} cy={cy} r="1.2" style={{ fill: 'var(--c-primary)', stroke: 'var(--c-bg)' }} strokeWidth="0.4" />
                  </>
                )
              })()}
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
          <text x={DX + DW / 2} y={DY + DH / 2} textAnchor="middle" fontSize="4" style={{ fill: 'var(--c-text-muted)' }}>该周期暂无记录</text>
        )}

        {hasData && yTicks.map(t => (
          <line key={`grid-${t.value}`} x1={DX} y1={t.y} x2={DX + DW} y2={t.y} style={{ stroke: 'var(--c-border)' }} strokeWidth="0.2" strokeDasharray="1.5,2.5" opacity="0.35" />
        ))}

        <line x1={DX} y1={DY} x2={DX} y2={DB} style={{ stroke: 'var(--c-border)' }} strokeWidth="0.3" />
        <line x1={DX} y1={DB} x2={DX + DW} y2={DB} style={{ stroke: 'var(--c-border)' }} strokeWidth="0.3" />
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            zIndex: 50,
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--c-text)',
            color: 'var(--c-bg)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            boxShadow: 'var(--shadow-lg)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
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
