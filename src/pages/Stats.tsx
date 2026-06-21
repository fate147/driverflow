import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths, subDays } from 'date-fns'
import { TrendingUp, Clock, Wallet, Wrench, ChevronLeft, ChevronRight, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion'
import Layout from '../components/layout/Layout'
import DistrictChart from '../components/DistrictChart'
import StatsCharts from '../components/StatsCharts'
import { useRecords, calculateHours } from '../hooks/useRecords'

type Period = 'week' | 'month' | 'all'

export default function Stats() {
  const navigate = useNavigate()
  const { records, loading } = useRecords()
  const [period, setPeriod] = useState<Period>('month')
  const [offset, setOffset] = useState(0)

  const { startDate, endDate, periodLabel } = useMemo(() => {
    const baseDate = new Date()
    let start: Date, end: Date, label: string
    if (period === 'week') {
      const targetDate = addWeeks(baseDate, offset)
      start = startOfWeek(targetDate, { weekStartsOn: 1 })
      end = endOfWeek(targetDate, { weekStartsOn: 1 })
      label = `${format(start, 'M/d')} - ${format(end, 'M/d')}`
    } else if (period === 'month') {
      const targetDate = addMonths(baseDate, offset)
      start = startOfMonth(targetDate)
      end = endOfMonth(targetDate)
      label = `${format(start, 'yyyy年M月')}`
    } else {
      start = new Date(0)
      end = new Date(8640000000000000)
      label = '全部'
    }
    return { startDate: start, endDate: end, periodLabel: label }
  }, [period, offset])

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const d = new Date(r.date)
      return d >= startDate && d <= endDate
    })
  }, [records, startDate, endDate])

  const stats = useMemo(() => {
    const totalIncome = filteredRecords.reduce((s, r) => s + r.income, 0)
    const totalHours = filteredRecords.reduce((s, r) => s + calculateHours(r.start_time, r.end_time), 0)
    const totalRepairFee = filteredRecords.reduce((s, r) => s + r.repair_fee, 0)
    const avgHourlyRate = totalHours > 0 ? Math.round(((totalIncome - totalRepairFee) / totalHours) * 100) / 100 : 0
    return { totalIncome, totalHours, totalRepairFee, avgHourlyRate }
  }, [filteredRecords])

  const weeklyChartData = useMemo(() => {
    const allDates = records.map(r => r.date).sort().reverse()
    if (allDates.length === 0) return []
    const latestDate = new Date(allDates[0])
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(latestDate, 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayRecords = records.filter(r => r.date === dateStr)
      return { date: format(date, 'M/d'), income: dayRecords.reduce((sum, r) => sum + r.income, 0) }
    })
  }, [records])

  const monthlyChartData = useMemo(() => {
    const allDates = records.map(r => r.date).sort().reverse()
    if (allDates.length === 0) return []
    const latestDate = new Date(allDates[0])
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(latestDate, 29 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayRecords = records.filter(r => r.date === dateStr)
      const income = dayRecords.reduce((sum, r) => sum + r.income, 0)
      const hours = dayRecords.reduce((sum, r) => sum + calculateHours(r.start_time, r.end_time), 0)
      return { date: format(date, 'M/d'), income, hourlyRate: hours > 0 ? Math.round((income / hours) * 100) / 100 : 0 }
    })
  }, [records])

  const dailyData = useMemo(() => {
    const grouped = new Map<string, { income: number; hours: number; repairFee: number; records: any[] }>()
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
        hourlyRate: data.hours > 0 ? Math.round((data.income / data.hours) * 100) / 100 : 0,
      }))
  }, [filteredRecords])

  const handlePeriodChange = (newPeriod: Period) => { setPeriod(newPeriod); setOffset(0) }
  const navigatePeriod = (direction: 'prev' | 'next') => setOffset(prev => direction === 'prev' ? prev - 1 : prev + 1)

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">数据统计</h2>
            <p className="text-muted-foreground text-xs md:text-sm">查看收入数据分析</p>
          </div>
          {period !== 'all' && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigatePeriod('prev')} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium min-w-[100px] text-center">{periodLabel}</span>
              <Button variant="ghost" size="icon" onClick={() => navigatePeriod('next')} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {(['week', 'month', 'all'] as const).map(p => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => handlePeriodChange(p)} className="text-xs sm:text-sm">
              {p === 'week' ? '周' : p === 'month' ? '月' : '全部'}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">总流水</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-lg sm:text-2xl font-bold">¥{stats.totalIncome.toFixed(2)}</div>
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
              <Wrench className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-lg sm:text-2xl font-bold">¥{stats.totalRepairFee.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base">近7天流水</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyChartData.some(d => d.income > 0) ? (
                <StatsCharts data={weeklyChartData} type="bar" />
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">暂无数据</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base">近30天趋势</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyChartData.some(d => d.income > 0) ? (
                <StatsCharts data={monthlyChartData} type="area" />
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">暂无数据</p>
              )}
            </CardContent>
          </Card>
        </div>

        <DistrictChart records={filteredRecords} />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">每日数据</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">该周期暂无数据</p>
            ) : (
              <Accordion>
                {dailyData.map((day) => (
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
                          <div><p className="text-muted-foreground">修车费</p><p className="font-medium">¥{day.repairFee.toFixed(2)}</p></div>
                        </div>
                        <div className="space-y-1.5">
                          {day.records.map((record: any) => (
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
                        <p className="font-medium text-sm">{format(new Date(record.date), 'MM月dd日')}</p>
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
