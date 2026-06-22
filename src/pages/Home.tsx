import { useMemo } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import Layout from '../components/layout/Layout'
import DistrictChart from '../components/DistrictChart'
import { useRecords } from '../hooks/useRecords'

// SVG layout constants
const L = { left: 10, top: 3, right: 2, bottom: 8, width: 120, height: 44 }
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

export default function Home() {
  const { records, loading } = useRecords()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const chartData = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()
    // 一次遍历构建日期→收入映射
    const incomeByDate = new Map<string, number>()
    for (const r of records) {
      incomeByDate.set(r.date, (incomeByDate.get(r.date) || 0) + r.income)
    }
    // 按天取值，O(总天数) 而非 O(总天数×记录数)
    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1
      const dateStr = format(new Date(currentYear, currentMonth, day), 'yyyy-MM-dd')
      return { day, income: incomeByDate.get(dateStr) || 0 }
    })
  }, [records, currentYear, currentMonth])

  const maxIncome = useMemo(() => Math.max(...chartData.map(d => d.income), 1), [chartData])
  const { ticks: yTicks, maxAxis } = useMemo(() => computeYTicks(maxIncome), [maxIncome])
  const hasData = chartData.some(d => d.income > 0)
  const totalDays = chartData.length

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">{currentMonth + 1}月流水</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 overflow-hidden">
            <svg viewBox={`0 0 ${L.width} ${L.height}`} className="w-full" style={{ display: 'block' }}>
              {/* X-axis: day numbers */}
              {chartData.map((d, i) => {
                const margin = DW * 0.03
                const innerW = DW - 2 * margin
                const x = DX + margin + (i / (totalDays - 1)) * innerW
                return (
                  <text key={d.day} x={x} y={DB + 8} textAnchor="middle" fontSize="3" fill="#888">{d.day}</text>
                )
              })}

              {/* Y-axis labels */}
              {yTicks.map(t => (
                <text key={t.value} x={DX - 2} y={t.y + 1.2} textAnchor="end" fontSize="3.5" fill="#888">¥{t.value}</text>
              ))}

              {/* Data bars */}
              {hasData ? chartData.map(d => {
                const barW = Math.max(DW / totalDays * 0.55, 1.2)
                const margin = DW * 0.03
                const innerW = DW - 2 * margin
                const cx = DX + margin + ((d.day - 1) / (totalDays - 1)) * innerW
                const barH = (d.income / maxAxis) * DH
                return d.income > 0 ? (
                  <rect key={`bar-${d.day}`} x={cx - barW / 2} y={DB - barH} width={barW} height={barH} fill="#3b82f6" rx="0.6" />
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
          </CardContent>
        </Card>

        <DistrictChart records={records} />
      </div>
    </Layout>
  )
}
