import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { DISTRICTS } from '../lib/constants'
import type { Record } from '../types'

interface DistrictChartProps {
  records: Record[]
}

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
        opacity: 1 - (i * 0.08),
      }
    }).sort((a, b) => b.days - a.days)
    const maxDays = Math.max(...data.map(d => d.days), 1)
    return data.map(d => ({ ...d, ratio: d.days / maxDays }))
  }, [records])

  return (
    <div className="card">
      <div className="card-header" style={{ paddingBottom: 'var(--space-2)' }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
          <MapPin style={{ width: '16px', height: '16px' }} />
          跑车区域统计
        </div>
      </div>
      <div className="card-content" style={{ padding: 'var(--space-2) var(--space-4)' }}>
        {chartData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {chartData.map((item) => (
              <div key={item.district} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--c-text-secondary)',
                  width: '64px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }} title={item.district}>
                  {item.district}
                </span>
                <div style={{
                  flex: 1,
                  height: '20px',
                  background: 'var(--c-bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 300ms ease',
                      width: `${Math.max(item.ratio * 100, 4)}%`,
                      background: 'var(--c-primary)',
                      opacity: item.opacity,
                    }}
                  />
                </div>
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  width: '32px',
                  textAlign: 'right',
                  flexShrink: 0,
                }}>{item.days}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            textAlign: 'center',
            color: 'var(--c-text-secondary)',
            padding: 'var(--space-8) 0',
            fontSize: 'var(--font-size-sm)',
            margin: 0,
          }}>暂无区域数据</p>
        )}
      </div>
    </div>
  )
}
