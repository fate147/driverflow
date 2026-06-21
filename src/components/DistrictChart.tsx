import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../components/ui/chart'
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

  const chartConfig: ChartConfig = {
    days: {
      label: '出车天数',
      color: '#3b82f6',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          跑车区域统计
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeDistricts.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData} layout="vertical">
              <CartesianGrid horizontal={false} stroke="oklch(1 0 0 / 10%)" />
              <YAxis
                dataKey="district"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'oklch(0.985 0 0)', fontSize: 12 }}
                width={80}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'oklch(0.708 0 0)', fontSize: 10 }}
                domain={[0, 30]}
                ticks={[0, 5, 10, 15, 20, 25, 30]}
                tickFormatter={(value) => `${value}天`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="days" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.district} fill={getColorByValue(entry.days, maxDays)} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-center text-muted-foreground py-8">暂无区域数据</p>
        )}
      </CardContent>
    </Card>
  )
}
