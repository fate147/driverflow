import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths } from 'date-fns'
import { useRecords, calculateHours } from '../hooks/useRecords'
import type { Record } from '../types'

type Period = 'week' | 'month' | 'year'

export function useStats() {
  const navigate = useNavigate()
  const { records, loading } = useRecords()
  const [period, setPeriod] = useState<Period>('month')
  const [offset, setOffset] = useState(0)
  const [recordSearch, setRecordSearch] = useState('')

  const { startDate, endDate, periodLabel } = useMemo(() => {
    const today = new Date()
    let start: Date, end: Date, label: string
    if (period === 'week') {
      const targetDate = addWeeks(new Date(), offset)
      start = startOfWeek(targetDate, { weekStartsOn: 1 })
      end = endOfWeek(targetDate, { weekStartsOn: 1 })
      label = `${format(start, 'M/d')} - ${format(end, 'M/d')}`
    } else if (period === 'month') {
      const targetDate = addMonths(today, offset)
      start = startOfMonth(targetDate)
      end = endOfMonth(targetDate)
      label = `${format(start, 'yyyy年M月')}`
    } else {
      const year = today.getFullYear() + offset
      start = new Date(year, 0, 1)
      end = new Date(year, 11, 31)
      label = `${year}年`
    }
    return { startDate: start, endDate: end, periodLabel: label }
  }, [period, offset])

  const filteredRecords = useMemo(() => {
    const startStr = format(startDate, 'yyyy-MM-dd')
    const endStr = format(endDate, 'yyyy-MM-dd')
    return records.filter(r => r.date >= startStr && r.date <= endStr)
  }, [records, startDate, endDate])

  const stats = useMemo(() => {
    const totalIncome = filteredRecords.reduce((s, r) => s + r.income, 0)
    const totalHours = filteredRecords.reduce((s, r) => s + calculateHours(r.start_time, r.end_time), 0)
    const totalRepairFee = filteredRecords.reduce((s, r) => s + r.repair_fee, 0)
    const avgHourlyRate = totalHours > 0 ? Math.round(((totalIncome - totalRepairFee) / totalHours) * 100) / 100 : 0
    return { totalIncome, totalHours, totalRepairFee, avgHourlyRate }
  }, [filteredRecords])

  const periodBarData = useMemo(() => {
    if (period === 'year') {
      const year = startDate.getFullYear()
      const monthMap = new Map<string, number>()
      for (const r of filteredRecords) {
        const monthKey = format(new Date(r.date), 'yyyy-MM')
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + r.income)
      }
      return Array.from({ length: 12 }, (_, i) => ({
        date: `${i + 1}月`,
        income: monthMap.get(`${year}-${String(i + 1).padStart(2, '0')}`) || 0,
      }))
    }

    const startStr = format(startDate, 'yyyy-MM-dd')
    const endStr = format(endDate, 'yyyy-MM-dd')
    const dayCount = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1
    const incomeByDate = new Map<string, number>()
    for (const r of filteredRecords) {
      incomeByDate.set(r.date, (incomeByDate.get(r.date) || 0) + r.income)
    }
    return Array.from({ length: dayCount }, (_, i) => {
      const date = new Date(startDate.getTime() + i * 86400000)
      const dateStr = format(date, 'yyyy-MM-dd')
      if (dateStr < startStr || dateStr > endStr) return { date: format(date, 'd'), income: 0 }
      return { date: format(date, 'd'), income: incomeByDate.get(dateStr) || 0 }
    })
  }, [period, filteredRecords, startDate, endDate])

  const dailyData = useMemo(() => {
    if (period === 'year') {
      const year = startDate.getFullYear()
      const grouped = new Map<string, { income: number; hours: number; repairFee: number; records: Record[] }>()
      for (const r of filteredRecords) {
        const monthKey = format(new Date(r.date), 'yyyy-MM')
        const existing = grouped.get(monthKey) || { income: 0, hours: 0, repairFee: 0, records: [] }
        existing.income += r.income
        existing.hours += calculateHours(r.start_time, r.end_time)
        existing.repairFee += r.repair_fee
        existing.records.push(r)
        grouped.set(monthKey, existing)
      }
      return Array.from({ length: 12 }, (_, i) => {
        const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`
        const data = grouped.get(monthKey) || { income: 0, hours: 0, repairFee: 0, records: [] }
        return {
          date: monthKey,
          displayDate: `${i + 1}月`,
          ...data,
          hourlyRate: data.hours > 0 ? Math.round(((data.income - data.repairFee) / data.hours) * 100) / 100 : 0
        }
      }).reverse()
    }

    const grouped = new Map<string, { income: number; hours: number; repairFee: number; records: Record[] }>()
    for (const r of filteredRecords) {
      const existing = grouped.get(r.date) || { income: 0, hours: 0, repairFee: 0, records: [] }
      existing.income += r.income
      existing.hours += calculateHours(r.start_time, r.end_time)
      existing.repairFee += r.repair_fee
      existing.records.push(r)
      grouped.set(r.date, existing)
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, data]) => ({
        date,
        displayDate: format(new Date(date), 'MM月dd日'),
        ...data,
        hourlyRate: data.hours > 0 ? Math.round(((data.income - data.repairFee) / data.hours) * 100) / 100 : 0,
      }))
  }, [period, filteredRecords, startDate])

  const filteredDailyData = useMemo(() => {
    if (!recordSearch.trim()) return dailyData
    const q = recordSearch.trim().toLowerCase()
    return dailyData.filter(day =>
      day.displayDate.toLowerCase().includes(q) ||
      day.records.some(r =>
        r.start_time.includes(q) || r.end_time.includes(q) ||
        (r.districts && r.districts.some(d => d.toLowerCase().includes(q)))
      )
    )
  }, [dailyData, recordSearch])

  const handlePeriodChange = (newPeriod: Period) => { setPeriod(newPeriod); setOffset(0) }
  const navigatePeriod = (direction: 'prev' | 'next') => setOffset(prev => direction === 'prev' ? prev - 1 : prev + 1)

  const exportCSV = () => {
    const headers = ['日期', '出车时间', '收车时间', '流水(元)', '时薪(元/时)', '修车费(元)', '区域']
    const rows = filteredRecords.map(r => [
      r.date,
      r.start_time,
      r.end_time,
      r.income.toFixed(2),
      (calculateHours(r.start_time, r.end_time) > 0 ? ((r.income - r.repair_fee) / calculateHours(r.start_time, r.end_time)).toFixed(2) : '0'),
      r.repair_fee.toFixed(2),
      (r.districts || []).join('/')
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `driverflow-${periodLabel}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const chartTitle = period === 'year' ? '年度月度汇总' : period === 'week' ? '本周每日流水' : '本月每日流水'

  return {
    navigate,
    records,
    loading,
    period,
    periodLabel,
    recordSearch,
    setRecordSearch,
    stats,
    periodBarData,
    dailyData,
    filteredDailyData,
    filteredRecords,
    chartTitle,
    handlePeriodChange,
    navigatePeriod,
    exportCSV,
  }
}
