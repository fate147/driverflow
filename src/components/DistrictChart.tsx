import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { MapPin } from 'lucide-react'
import { DISTRICTS } from '../lib/constants'
import type { Record } from '../types'

interface DistrictChartProps {
  records: Record[]
}

const BAR_COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#60a5fa', '#93c5fd', '#bfdbfe', '#3b82f6', '#2563eb', '#1d4ed8', '#60a5fa']

export default function DistrictChart({ records }: DistrictChartProps) {
  const chartData = useMemo(() => {
    const activeDistricts = DISTRICTS.filter(d => records.some(r => r.districts?.includes(d)))
    if (activeDistricts.length === 0) return []
    const data = activeDistricts.map((d, i) => {
      const districtRecords = records.filter(r => r.districts?.includes(d))
      const daySet = new Set(districtRecords.map(r => r.date))
      return {
        district: d,
        days: daySet.size,
        color: BAR_COLORS[i % BAR_COLORS.length],
      }
    }).sort((a, b) => b.days - a.days)
    const maxDays = Math.max(...data.map(d => d.days), 1)
    return data.map(d => ({ ...d, ratio: d.days / maxDays }))
  }, [records])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          <MapPin className="h-4 w-4" />
          跑车区域统计
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        {chartData.length > 0 ? (
          <div className="space-y-2">
            {chartData.map((item) => (
              <div key={item.district} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 truncate" title={item.district}>
                  {item.district}
                </span>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-300"
                    style={{
                      width: `${Math.max(item.ratio * 100, 4)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <span className="text-xs font-medium w-8 text-right shrink-0">{item.days}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">暂无区域数据</p>
        )}
      </CardContent>
    </Card>
  )
}
