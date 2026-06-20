import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, Clock, DollarSign, Wrench, TrendingUp, Plus, BarChart3 } from 'lucide-react'
import Card from '../components/ui/Card'
import Layout from '../components/layout/Layout'
import { useRecords, calculateHours } from '../hooks/useRecords'
import { Record, DailySummary } from '../types'

function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

function getWeekDates(): string[] {
  const today = new Date()
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(format(d, 'yyyy-MM-dd'))
  }
  return dates
}

function calculateDailySummary(date: string, records: Record[]): DailySummary {
  const dayRecords = records.filter(r => r.date === date)
  const totalIncome = dayRecords.reduce((sum, r) => sum + r.income, 0)
  const totalHours = dayRecords.reduce((sum, r) => sum + calculateHours(r.start_time, r.end_time), 0)
  const totalRepairFee = dayRecords.reduce((sum, r) => sum + r.repair_fee, 0)
  const avgHourlyRate = totalHours > 0 ? Math.round((totalIncome / totalHours) * 100) / 100 : 0

  return {
    date,
    totalIncome,
    totalHours,
    avgHourlyRate,
    totalRepairFee,
  }
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { records, loading } = useRecords()
  const today = getToday()
  const weekDates = getWeekDates()
  const todayRecords = records.filter(r => r.date === today)
  const todaySummary = todayRecords.length > 0
    ? calculateDailySummary(today, records)
    : null

  const weekSummaries = weekDates.map(date => ({
    date,
    summary: calculateDailySummary(date, records),
  }))

  const weeklyTotal = weekSummaries.reduce((acc, ws) => ({
    totalIncome: acc.totalIncome + ws.summary.totalIncome,
    totalHours: acc.totalHours + ws.summary.totalHours,
    totalRepairFee: acc.totalRepairFee + ws.summary.totalRepairFee,
  }), { totalIncome: 0, totalHours: 0, totalRepairFee: 0 })

  const weeklyAvgHourly = weeklyTotal.totalHours > 0
    ? Math.round((weeklyTotal.totalIncome / weeklyTotal.totalHours) * 100) / 100
    : 0

  const recentRecords = records.slice(0, 5)

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
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white">仪表盘</h1>
          <p className="text-sm text-gray-400 mt-1">{format(new Date(), 'yyyy年MM月dd日')}</p>
        </div>

        {/* Today Card */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5">
          {todaySummary ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">今日数据</h2>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={DollarSign}
                  label="今日流水"
                  value={`¥${todaySummary.totalIncome.toFixed(2)}`}
                  color="bg-green-500/20 text-green-400"
                />
                <StatCard
                  icon={Clock}
                  label="出车时长"
                  value={`${todaySummary.totalHours.toFixed(1)}小时`}
                  color="bg-blue-500/20 text-blue-400"
                />
                <StatCard
                  icon={TrendingUp}
                  label="平均时薪"
                  value={`¥${todaySummary.avgHourlyRate.toFixed(2)}`}
                  color="bg-purple-500/20 text-purple-400"
                />
                <StatCard
                  icon={Wrench}
                  label="修车费"
                  value={`¥${todaySummary.totalRepairFee.toFixed(2)}`}
                  color="bg-orange-500/20 text-orange-400"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-4">暂无今日记录</p>
              <Link
                to="/record"
                className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                添加今日记录
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/record"
            className="block p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold">记录今日</h3>
            <p className="text-sm text-white/70 mt-1">添加新的收入记录</p>
          </Link>
          <Link
            to="/stats"
            className="block p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-colors"
          >
            <BarChart3 className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold">查看统计</h3>
            <p className="text-sm text-gray-400 mt-1">查看详细数据分析</p>
          </Link>
        </div>

        {/* Weekly Summary */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">本周数据</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-xs text-gray-400 mb-1">总流水</p>
              <p className="text-xl font-bold text-green-400">¥{weeklyTotal.totalIncome.toFixed(2)}</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-400 mb-1">总时长</p>
              <p className="text-xl font-bold text-blue-400">{weeklyTotal.totalHours.toFixed(1)}h</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-400 mb-1">平均时薪</p>
              <p className="text-xl font-bold text-purple-400">¥{weeklyAvgHourly.toFixed(2)}</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-400 mb-1">修车费</p>
              <p className="text-xl font-bold text-orange-400">¥{weeklyTotal.totalRepairFee.toFixed(2)}</p>
            </Card>
          </div>
        </div>

        {/* Recent Records */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">最近记录</h2>
          {recentRecords.length === 0 ? (
            <Card>
              <p className="text-center text-gray-400 py-8">暂无记录</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentRecords.map(record => (
                <Card key={record.id} className="hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">
                        {format(new Date(record.date), 'MM月dd日')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {record.start_time} - {record.end_time}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold text-green-400">
                        ¥{record.income.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        ¥{record.hourly_rate.toFixed(2)}/h
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
