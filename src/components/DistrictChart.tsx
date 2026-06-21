import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { MapPin } from 'lucide-react'
import { DISTRICTS } from '../lib/constants'

const getColorByValue = (days: number, maxDays: number): string => {
  if (maxDays === 0) return '#3b82f6'
  const ratio = days / maxDays
  if (ratio >= 0.8) return '#1d4ed8'
  if (ratio >= 0.6) return '#2563eb'
  if (ratio >= 0.4) return '#3b82f6'
  if (ratio >= 0.2) return '#60a5fa'
  return '#93c5fd'
}

interface DistrictChartProps {
  records: any[]
}

export default function DistrictChart({ records }: DistrictChartProps) {
  const activeDistricts = useMemo(() => {
    return DISTRICTS.filter(d => records.some(r => r.districts?.includes(d)))
  }, [records])

  const chartData = useMemo(() => {
    if (activeDistricts.length === 0) return []
    return activeDistricts.map(d => {
      const districtRecords = records.filter(r => r.districts?.includes(d))
      const daySet = new Set(districtRecords.map(r => r.date))
      return {
        district: d,
        days: daySet.size,
      }
    }).sort((a, b) => b.days - a.days)
  }, [records, activeDistricts])

  const maxDays = useMemo(() => {
    return Math.max(...chartData.map(d => d.days), 1)
  }, [chartData])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          <MapPin className="h-4 w-4" />
          跑车区域统计
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        {activeDistricts.length > 0 ? (
          <div className="overflow-x-auto">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
              width={undefined}
              height={Math.max(200, chartData.length * 40)}
            >
              <CartesianGrid horizontal={false} stroke="oklch(1 0 0 / 10%)" />
              <YAxis
                dataKey="district"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'oklch(0.985 0 0)', fontSize: 11 }}
                width={65}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'oklch(0.708 0 0)', fontSize: 10 }}
                domain={[0, 30]}
                ticks={[0, 5, 10, 15, 20, 25, 30]}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.205 0 0)',
                  border: '1px solid oklch(1 0 0 / 10%)',
                  borderRadius: '8px',
                  color: 'oklch(0.985 0 0)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="days" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.district} fill={getColorByValue(entry.days, maxDays)} />
                ))}
              </Bar>
            </BarChart>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">暂无区域数据</p>
        )}
      </CardContent>
    </Card>
  )
}
