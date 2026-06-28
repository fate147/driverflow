import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Wallet, CalendarDays, TrendingUp, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import Layout from '../components/layout/Layout'
import DistrictChart from '../components/DistrictChart'
import { useRecords, calculateHours } from '../hooks/useRecords'
import { smoothAreaPath, polylinePath } from '../lib/utils'

// SVG layout constants
const L = { left: 10, top: 3, right: 2, bottom: 8, width: 120, height: 44 }
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

export default function Home() {
  const navigate = useNavigate()
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
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: number; income: number; cx: number; cy: number } | null>(null)

  const monthlyStats = useMemo(() => {
    const monthRecords = records.filter(r => {
      const d = new Date(r.date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    })
    const totalIncome = monthRecords.reduce((s, r) => s + r.income, 0)
    const workDays = new Set(monthRecords.map(r => r.date)).size
    const totalHours = monthRecords.reduce((s, r) => s + calculateHours(r.start_time, r.end_time), 0)
    const totalRepair = monthRecords.reduce((s, r) => s + r.repair_fee, 0)
    const avgRate = totalHours > 0 ? (totalIncome - totalRepair) / totalHours : 0
    return { totalIncome, workDays, avgRate }
  }, [records, currentYear, currentMonth])

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-20" /></CardContent></Card>
            ))}
          </div>
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* 本月摘要 */}
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-1.5 text-primary/70 mb-2">
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-medium">本月流水</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-primary tracking-tight">¥{monthlyStats.totalIncome.toFixed(0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="text-xs">出车天数</span>
              </div>
              <div className="text-lg sm:text-xl font-bold">{monthlyStats.workDays}天</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs">时薪</span>
              </div>
              <div className="text-lg sm:text-xl font-bold">¥{monthlyStats.avgRate.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">{currentMonth + 1}月流水</CardTitle>
          </CardHeader>
          <CardContent className="relative p-2 sm:p-4">
            {hasData ? (
            <svg viewBox={`0 0 ${L.width} ${L.height}`} className="w-full" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
                  </linearGradient>
                </defs>

                {/* X-axis: day numbers (间隔显示避免过密) */}
                {chartData.filter((_, i) => {
                  const labelInterval = totalDays > 20 ? Math.ceil(totalDays / 6) : 1
                  return i % labelInterval === 0 || i === totalDays - 1
                }).map(d => {
                  const i = chartData.indexOf(d)
                  const margin = DW * 0.03
                  const innerW = DW - 2 * margin
                  const x = DX + margin + (i / (totalDays - 1)) * innerW
                  return (
                    <text key={d.day} x={x} y={DB + 8} textAnchor="middle" fontSize="3" fill="#a3a3a3">{d.day}</text>
                  )
                })}

                {/* Y-axis labels */}
                {yTicks.map(t => (
                  <text key={t.value} x={DX - 2} y={t.y + 1.2} textAnchor="end" fontSize="3.5" fill="#a3a3a3">¥{t.value}</text>
                ))}

                {/* Area chart */}
                {(() => {
                  const margin = DW * 0.03
                  const innerW = DW - 2 * margin
                  const points = chartData.map((d, i) => ({
                    x: DX + margin + (i / (totalDays - 1)) * innerW,
                    y: DB - (d.income / maxAxis) * DH,
                  }))
                  const pathD = smoothAreaPath(points, DB)
                  return (
                    <>
                      <path d={pathD} fill="url(#areaGradient)" />
                      <path d={polylinePath(points)} fill="none" stroke="#3b82f6" strokeWidth="0.4" strokeLinejoin="round" strokeOpacity="0.7" />
                      {/* Hover indicator */}
                      {tooltip && (() => {
                        const cx = DX + margin + ((tooltip.day - 1) / (totalDays - 1)) * innerW
                        const cy = DB - (tooltip.income / maxAxis) * DH
                        return (
                          <>
                            <line x1={cx} y1={DY} x2={cx} y2={DB} stroke="#3b82f6" strokeWidth="0.3" strokeDasharray="1.5,2.5" opacity="0.5" />
                            <circle cx={cx} cy={cy} r="1.2" fill="#3b82f6" stroke="#fff" strokeWidth="0.4" />
                          </>
                        )
                      })()}
                      {/* Hit targets for tooltip */}
                      {chartData.map((d, i) => {
                        const hitW = Math.max(DW / totalDays, 3)
                        const cx = DX + margin + (i / (totalDays - 1)) * innerW
                        return (
                          <rect
                            key={`hit-${d.day}`}
                            x={cx - hitW / 2} y={DY}
                            width={hitW} height={DH}
                            fill="transparent"
                            onMouseEnter={(e) => {
                              const svg = (e.currentTarget as SVGElement).closest('svg')!
                              const r = svg.getBoundingClientRect()
                              const scaleX = r.width / L.width
                              const cy = DB - (d.income / maxAxis) * DH
                              setTooltip({ x: r.left + cx * scaleX, y: r.top - 8, day: d.day, income: d.income, cx, cy })
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          />
                        )
                      })}
                    </>
                  )
                })()}
                {/* Grid lines */}
                {yTicks.map(t => (
                  <line key={`grid-${t.value}`} x1={DX} y1={t.y} x2={DX + DW} y2={t.y} stroke="#4b5563" strokeWidth="0.2" strokeDasharray="1.5,2.5" opacity="0.35" />
                ))}
                {/* Axis borders */}
                <line x1={DX} y1={DY} x2={DX} y2={DB} stroke="#e5e7eb" strokeWidth="0.3" />
                <line x1={DX} y1={DB} x2={DX + DW} y2={DB} stroke="#e5e7eb" strokeWidth="0.3" />
              </svg>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wallet className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">本月暂无流水记录</p>
                <p className="text-xs text-muted-foreground/60 mt-1 mb-4">添加你的第一笔记录，开始追踪收入</p>
                <Button size="sm" onClick={() => navigate('/record')}>
                  <Plus className="h-4 w-4 mr-1" />
                  立即记录
                </Button>
              </div>
            )}

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
                  {currentMonth + 1}月{tooltip.day}日 · ¥{tooltip.income.toFixed(0)}
                </div>
              )}
          </CardContent>
        </Card>

        <DistrictChart records={records} />
      </div>
    </Layout>
  )
}
