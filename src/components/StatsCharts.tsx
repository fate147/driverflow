import { useMemo } from 'react'

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
  const step = maxValue <= 500 ? 100 : maxValue <= 1000 ? 200 : maxValue <= 5000 ? 500 : 1000
  const maxAxis = Math.max(Math.ceil(maxValue / step) * step, 700)
  const ticks = []
  for (let v = 0; v <= maxAxis; v += step) {
    ticks.push({ value: v, y: DB - (v / maxAxis) * DH })
  }
  return { ticks, maxAxis }
}

export default function StatsCharts({ data }: StatsChartsProps) {
  const maxIncome = useMemo(() => Math.max(...data.map(d => d.income), 1), [data])
  const { ticks: yTicks, maxAxis } = useMemo(() => computeYTicks(maxIncome), [maxIncome])
  const hasData = data.some(d => d.income > 0)
  const count = data.length

  if (count === 0) {
    return <p className="text-center text-muted-foreground py-8 text-sm">暂无数据</p>
  }

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${L.width} ${L.height}`} className="w-full" style={{ display: 'block' }}>
        {/* Y-axis labels */}
        {yTicks.map(t => (
          <text key={t.value} x={DX - 2} y={t.y + 1.2} textAnchor="end" fontSize="3.5" fill="#888">¥{t.value}</text>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const margin = DW * 0.06
          const innerW = DW - 2 * margin
          const x = DX + margin + (i / (count - 1 || 1)) * innerW
          return (
            <text key={i} x={x} y={DB + 8} textAnchor="middle" fontSize="3" fill="#888">{d.date}</text>
          )
        })}

        {/* Data bars */}
        {hasData ? data.map((d, i) => {
          const barW = Math.max(DW / count * 0.55, 1.2)
          const margin = DW * 0.06
          const innerW = DW - 2 * margin
          const cx = DX + margin + (i / (count - 1 || 1)) * innerW
          const barH = (d.income / maxAxis) * DH
          return d.income > 0 ? (
            <rect key={`bar-${i}`} x={cx - barW / 2} y={DB - barH} width={barW} height={barH} fill="#3b82f6" rx="0.6" />
          ) : null
        }) : (
          <text x={DX + DW / 2} y={DY + DH / 2} textAnchor="middle" fontSize="4" fill="#aaa">暂无数据</text>
        )}

        {/* Grid lines */}
        {hasData && yTicks.map(t => (
          <line key={`grid-${t.value}`} x1={DX} y1={t.y} x2={DX + DW} y2={t.y} stroke="#4b5563" strokeWidth="0.2" strokeDasharray="1.5,2.5" opacity="0.35" />
        ))}

        {/* Axis borders */}
        <line x1={DX} y1={DY} x2={DX} y2={DB} stroke="#e5e7eb" strokeWidth="0.3" />
        <line x1={DX} y1={DB} x2={DX + DW} y2={DB} stroke="#e5e7eb" strokeWidth="0.3" />
      </svg>
    </div>
  )
}
