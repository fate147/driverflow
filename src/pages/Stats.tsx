import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths } from 'date-fns'
import { TrendingUp, Clock, Wallet, Wrench, ChevronLeft, ChevronRight, Edit, Plus, Search, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion'
import Layout from '../components/layout/Layout'
import DistrictChart from '../components/DistrictChart'
import StatsCharts from '../components/StatsCharts'
import { useRecords, calculateHours } from '../hooks/useRecords'
import { Skeleton } from '../components/ui/skeleton'
import type { Record } from '../types'

type Period = 'week' | 'month' | 'year'

export default function Stats() {
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
      // 年 → 固定12个月
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

    // 周/月 → 按日展示
    const startStr = format(startDate, 'yyyy-MM-dd')
    const endStr = format(endDate, 'yyyy-MM-dd')
    const dayCount = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1
    // 一次遍历构建日期→收入映射
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

  // 年模式下按月份聚合（固定12个月），周/月按日
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
        return { date: monthKey, displayDate: `${i + 1}月`, ...data, hourlyRate: data.hours > 0 ? Math.round(((data.income - data.repairFee) / data.hours) * 100) / 100 : 0 }
      }).reverse()
    }

    // 周/月 → 按日
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
  }, [period, filteredRecords])

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

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-24" /></CardContent></Card>
            ))}
          </div>
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
        </div>
      </Layout>
    )
  }

  const chartTitle = period === 'year' ? '年度月度汇总' : period === 'week' ? '本周每日流水' : '本月每日流水'

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">数据统计</h2>
            <p className="text-muted-foreground text-xs md:text-sm">查看收入数据分析</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />
              导出
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigatePeriod('prev')} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs sm:text-sm font-medium min-w-[100px] text-center">{periodLabel}</span>
            <Button variant="ghost" size="icon" onClick={() => navigatePeriod('next')} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {(['week', 'month', 'year'] as const).map(p => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => handlePeriodChange(p)} className="text-xs sm:text-sm">
              {p === 'week' ? '周' : p === 'month' ? '月' : '年'}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-primary/5 border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-primary/70">总流水</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-xl sm:text-3xl font-black text-primary tracking-tight">¥{stats.totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">总时长</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">时薪</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-lg sm:text-2xl font-bold">¥{stats.avgHourlyRate.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">修车费</CardTitle>
              <Wrench className="h-4 w-4 text-orange" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-lg sm:text-2xl font-bold text-orange">¥{stats.totalRepairFee.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base">{chartTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {periodBarData.some(d => d.income > 0) ? (
                <StatsCharts data={periodBarData} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground text-sm mb-3">暂无数据</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/record')}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加记录
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DistrictChart records={records} />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">{period === 'year' ? '每月数据' : '每日数据'}</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-sm mb-3">该周期暂无记录</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/record')}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加记录
                </Button>
              </div>
            ) : (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="搜索日期、时间、区域..."
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                    className="pl-9 h-8 text-xs"
                  />
                </div>
                <Accordion>
                  {filteredDailyData.map((day) => (
                  <AccordionItem key={day.date} value={day.date}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-medium text-sm">{day.displayDate}</span>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="font-medium text-sm">¥{day.income.toFixed(2)}</span>
                          <span className="text-muted-foreground text-xs">{day.records.length}条</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div><p className="text-muted-foreground">时长</p><p className="font-medium">{day.hours.toFixed(1)}h</p></div>
                          <div><p className="text-muted-foreground">时薪</p><p className="font-medium">¥{day.hourlyRate.toFixed(2)}</p></div>
                          <div><p className="text-muted-foreground">修车费</p><p className={`font-medium ${day.repairFee > 0 ? 'text-orange' : ''}`}>¥{day.repairFee.toFixed(2)}</p></div>
                        </div>
                        <div className="space-y-1.5">
                          {day.records.map((record: Record) => (
                            <div key={record.id} className="flex items-center justify-between p-2 rounded bg-muted gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{record.start_time}-{record.end_time}</span>
                                <span className="text-xs sm:text-sm font-medium">¥{record.income.toFixed(2)}</span>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/record/${record.id}`)} className="h-6 w-6 flex-shrink-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                </Accordion>
                {filteredDailyData.length === 0 && recordSearch && (
                  <p className="text-center text-muted-foreground py-6 text-sm">无匹配记录</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              修车记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.filter(r => r.repair_fee > 0).length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">该周期暂无修车记录</p>
            ) : (
              <div className="space-y-2">
                {filteredRecords
                  .filter(r => r.repair_fee > 0)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(record => (
                    <div key={record.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{format(new Date(record.date), period === 'year' ? 'M月dd日' : 'MM月dd日')}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {record.districts && record.districts.length > 0 ? record.districts.join('、') : '未选区域'}
                        </p>
                      </div>
                      <p className="font-medium text-destructive text-sm flex-shrink-0">¥{record.repair_fee.toFixed(2)}</p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
