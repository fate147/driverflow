import { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths } from 'date-fns'
import { Calendar, TrendingUp, Clock, Wallet, Wrench, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../components/ui/Card'
import Layout from '../components/layout/Layout'
import StatsCharts from '../components/StatsCharts'
import { useRecords, calculateHours } from '../hooks/useRecords'

type Period = 'week' | 'month' | 'all'

export default function Stats() {
  const { records, loading } = useRecords()
  const [period, setPeriod] = useState<Period>('week')
  const [offset, setOffset] = useState(0)

  const { startDate, endDate, periodLabel } = useMemo(() => {
    const baseDate = new Date()
    let start: Date
    let end: Date
    let label: string

    if (period === 'week') {
      const targetDate = addWeeks(baseDate, offset)
      start = startOfWeek(targetDate, { weekStartsOn: 1 })
      end = endOfWeek(targetDate, { weekStartsOn: 1 })
      label = `${format(start, 'M月d日')} - ${format(end, 'M月d日')}`
    } else if (period === 'month') {
      const targetDate = addMonths(baseDate, offset)
      start = startOfMonth(targetDate)
      end = endOfMonth(targetDate)
      label = `${format(start, 'yyyy年M月')}`
    } else {
      start = new Date(0)
      end = new Date(8640000000000000)
      label = '全部记录'
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

  const recordDays = useMemo(() => {
    const days = new Set(filteredRecords.map(r => r.date))
    return days.size
  }, [filteredRecords])

  const chartData = useMemo(() => {
    const grouped = new Map<string, { income: number; hours: number }>()
    for (const r of filteredRecords) {
      const existing = grouped.get(r.date) || { income: 0, hours: 0 }
      existing.income += r.income
      existing.hours += calculateHours(r.start_time, r.end_time)
      grouped.set(r.date, existing)
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { income, hours }]) => ({
        date: format(new Date(date), 'M/d'),
        income,
        hourlyRate: hours > 0 ? Math.round((income / hours) * 100) / 100 : 0,
      }))
  }, [filteredRecords])

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod)
    setOffset(0)
  }

  const navigate = (direction: 'prev' | 'next') => {
    setOffset(prev => direction === 'prev' ? prev - 1 : prev + 1)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">加载中...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">数据统计</h1>

        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {p === 'week' ? '周' : p === 'month' ? '月' : '全部'}
            </button>
          ))}
        </div>

        {period !== 'all' && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('prev')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-sm text-gray-400">{periodLabel}</span>
            <button
              onClick={() => navigate('next')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <Wallet className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 mb-1">总流水</p>
            <p className="text-xl font-bold text-green-400">¥{stats.totalIncome.toFixed(2)}</p>
          </Card>
          <Card className="text-center">
            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 mb-1">总时长</p>
            <p className="text-xl font-bold text-blue-400">{stats.totalHours.toFixed(1)}h</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 mb-1">平均时薪</p>
            <p className="text-xl font-bold text-purple-400">¥{stats.avgHourlyRate.toFixed(2)}</p>
          </Card>
          <Card className="text-center">
            <Wrench className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 mb-1">修车费</p>
            <p className="text-xl font-bold text-orange-400">¥{stats.totalRepairFee.toFixed(2)}</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-400">统计周期内记录天数</p>
              <p className="text-lg font-semibold text-white">
                {recordDays} <span className="text-sm text-gray-400">天</span>
              </p>
            </div>
          </div>
        </Card>

        {chartData.length > 0 ? (
          <Card>
            <StatsCharts data={chartData} />
          </Card>
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-500">该周期暂无数据</p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
