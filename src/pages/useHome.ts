import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useRecords, calculateHours } from '../hooks/useRecords'

const L = { left: 10, top: 3, right: 2, bottom: 8, width: 120, height: 44 }
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

export function useHome() {
  const navigate = useNavigate()
  const { records, loading } = useRecords()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const chartData = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()
    const incomeByDate = new Map<string, number>()
    for (const r of records) {
      incomeByDate.set(r.date, (incomeByDate.get(r.date) || 0) + r.income)
    }
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

  return {
    navigate,
    records,
    loading,
    chartData,
    yTicks,
    maxAxis,
    hasData,
    totalDays,
    tooltip,
    setTooltip,
    monthlyStats,
    currentMonth,
    L,
    DX,
    DY,
    DW,
    DH,
    DB,
  }
}
