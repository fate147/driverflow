import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import Layout from '../components/layout/Layout'
import DistrictChart from '../components/DistrictChart'
import { useRecords } from '../hooks/useRecords'

export default function Home() {
  const { records, loading } = useRecords()

  const monthlyChartData = useMemo(() => {
    const allDates = records.map(r => r.date).sort().reverse()
    if (allDates.length === 0) return []
    const latestDate = new Date(allDates[0])
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(latestDate, 29 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayRecords = records.filter(r => r.date === dateStr)
      const income = dayRecords.reduce((sum, r) => sum + r.income, 0)
      return { date: format(date, 'M/d'), income }
    })
  }, [records])

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
            <CardTitle className="text-sm md:text-base">30天流水趋势</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            {monthlyChartData.some(d => d.income > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthlyChartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 10%)" />
                  <XAxis dataKey="date" stroke="oklch(0.708 0 0)" tick={{ fill: 'oklch(0.708 0 0)', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis stroke="oklch(0.708 0 0)" tick={{ fill: 'oklch(0.708 0 0)', fontSize: 10 }} width={45} />
                  <Tooltip contentStyle={{ backgroundColor: 'oklch(0.205 0 0)', border: '1px solid oklch(1 0 0 / 10%)', borderRadius: '8px', color: 'oklch(0.985 0 0)', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} fill="url(#colorIncome)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">暂无数据</p>
            )}
          </CardContent>
        </Card>

        <DistrictChart records={records} />
      </div>
    </Layout>
  )
}
