import { Wallet, CalendarDays, TrendingUp, Plus } from 'lucide-react'
import Layout from '../components/layout/Layout'
import DistrictChart from '../components/DistrictChart'
import { smoothAreaPath, polylinePath } from '../lib/utils'
import { useHome } from './useHome'

export default function HomeView() {
  const {
    navigate,
    loading,
    chartData,
    yTicks,
    maxAxis,
    hasData,
    totalDays,
    tooltip,
    setTooltip,
    monthlyStats,
    currentMonth,
    L,
    DX,
    DY,
    DW,
    DH,
    DB,
    records,
  } = useHome()

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card">
                <div className="card-content" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div className="skeleton skeleton-text" style={{ width: '64px' }}></div>
                  <div className="skeleton" style={{ height: '24px', width: '80px' }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-content" style={{ padding: 'var(--space-4)' }}>
              <div className="skeleton" style={{ height: '192px', width: '100%' }}></div>
            </div>
          </div>
          <div className="card">
            <div className="card-content" style={{ padding: 'var(--space-4)' }}>
              <div className="skeleton" style={{ height: '128px', width: '100%' }}></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* 本月摘要 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="card" style={{
            background: 'var(--c-bg-secondary)',
            border: '1px solid var(--c-border)',
          }}>
            <div className="card-content" style={{ padding: 'var(--space-4) var(--space-5)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                color: 'var(--c-primary)',
                opacity: 0.8,
                marginBottom: 'var(--space-2)',
              }}>
                <Wallet style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>本月流水</span>
              </div>
              <div style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'var(--font-weight-black)',
                color: 'var(--c-primary)',
                letterSpacing: '-0.025em',
              }}>¥{monthlyStats.totalIncome.toFixed(0)}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content" style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                color: 'var(--c-text-secondary)',
                marginBottom: 'var(--space-1)',
              }}>
                <CalendarDays style={{ width: '14px', height: '14px' }} />
                <span style={{ fontSize: 'var(--font-size-xs)' }}>出车天数</span>
              </div>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--c-text)',
              }}>{monthlyStats.workDays}天</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content" style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                color: 'var(--c-text-secondary)',
                marginBottom: 'var(--space-1)',
              }}>
                <TrendingUp style={{ width: '14px', height: '14px' }} />
                <span style={{ fontSize: 'var(--font-size-xs)' }}>时薪</span>
              </div>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--c-text)',
              }}>¥{monthlyStats.avgRate.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ paddingBottom: 'var(--space-2)' }}>
            <div className="card-title" style={{ fontSize: 'var(--font-size-sm)' }}>{currentMonth + 1}月流水</div>
          </div>
          <div className="card-content" style={{ position: 'relative', padding: 'var(--space-2) var(--space-4)' }}>
            {hasData ? (
              <svg viewBox={`0 0 ${L.width} ${L.height}`} style={{ width: '100%', display: 'block' }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--c-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--c-primary)" stopOpacity="0.04" />
                  </linearGradient>
                </defs>

                {chartData.filter((_, i) => {
                  const labelInterval = totalDays > 20 ? Math.ceil(totalDays / 6) : 1
                  return i % labelInterval === 0 || i === totalDays - 1
                }).map(d => {
                  const i = chartData.indexOf(d)
                  const margin = DW * 0.03
                  const innerW = DW - 2 * margin
                  const x = DX + margin + (i / (totalDays - 1)) * innerW
                  return (
                    <text key={d.day} x={x} y={DB + 8} textAnchor="middle" fontSize="3" style={{ fill: 'var(--c-text-muted)' }}>{d.day}</text>
                  )
                })}

                {yTicks.map(t => (
                  <text key={t.value} x={DX - 2} y={t.y + 1.2} textAnchor="end" fontSize="3.5" style={{ fill: 'var(--c-text-muted)' }}>¥{t.value}</text>
                ))}

                {(() => {
                  const margin = DW * 0.03
                  const innerW = DW - 2 * margin
                  const points = chartData.map((d, i) => ({
                    x: DX + margin + (i / (totalDays - 1)) * innerW,
                    y: DB - (d.income / maxAxis) * DH,
                  }))
                  const pathD = smoothAreaPath(points, DB)
                  return (
                    <>
                      <path d={pathD} fill="url(#areaGradient)" />
                      <path d={polylinePath(points)} fill="none" style={{ stroke: 'var(--c-primary)' }} strokeWidth="0.4" strokeLinejoin="round" strokeOpacity="0.7" />
                      {tooltip && (() => {
                        const cx = DX + margin + ((tooltip.day - 1) / (totalDays - 1)) * innerW
                        const cy = DB - (tooltip.income / maxAxis) * DH
                        return (
                          <>
                            <line x1={cx} y1={DY} x2={cx} y2={DB} style={{ stroke: 'var(--c-primary)' }} strokeWidth="0.3" strokeDasharray="1.5,2.5" opacity="0.5" />
                            <circle cx={cx} cy={cy} r="1.2" style={{ fill: 'var(--c-primary)', stroke: 'var(--c-bg)' }} strokeWidth="0.4" />
                          </>
                        )
                      })()}
                      {chartData.map((d, i) => {
                        const hitW = Math.max(DW / totalDays, 3)
                        const cx = DX + margin + (i / (totalDays - 1)) * innerW
                        return (
                          <rect
                            key={`hit-${d.day}`}
                            x={cx - hitW / 2} y={DY}
                            width={hitW} height={DH}
                            fill="transparent"
                            onMouseEnter={(e) => {
                              const svg = (e.currentTarget as SVGElement).closest('svg')!
                              const r = svg.getBoundingClientRect()
                              const scaleX = r.width / L.width
                              const cy = DB - (d.income / maxAxis) * DH
                              setTooltip({ x: r.left + cx * scaleX, y: r.top - 8, day: d.day, income: d.income, cx, cy })
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          />
                        )
                      })}
                    </>
                  )
                })()}
                {yTicks.map(t => (
                  <line key={`grid-${t.value}`} x1={DX} y1={t.y} x2={DX + DW} y2={t.y} style={{ stroke: 'var(--c-border)' }} strokeWidth="0.2" strokeDasharray="1.5,2.5" opacity="0.35" />
                ))}
                <line x1={DX} y1={DY} x2={DX} y2={DB} style={{ stroke: 'var(--c-border)' }} strokeWidth="0.3" />
                <line x1={DX} y1={DB} x2={DX + DW} y2={DB} style={{ stroke: 'var(--c-border)' }} strokeWidth="0.3" />
              </svg>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-12) 0',
                textAlign: 'center',
              }}>
                <Wallet style={{ width: '32px', height: '32px', color: 'var(--c-text-muted)', opacity: 0.4, marginBottom: 'var(--space-2)' }} />
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--c-text-secondary)', margin: 0 }}>本月暂无流水记录</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--c-text-muted)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>添加你的第一笔记录，开始追踪收入</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/record')}>
                  <Plus style={{ width: '16px', height: '16px', marginRight: 'var(--space-1)' }} />
                  立即记录
                </button>
              </div>
            )}

            {tooltip && (
              <div
                style={{
                  position: 'fixed',
                  zIndex: 50,
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--c-text)',
                  color: 'var(--c-bg)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  boxShadow: 'var(--shadow-lg)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  left: tooltip.x,
                  top: tooltip.y - 8,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {currentMonth + 1}月{tooltip.day}日 · ¥{tooltip.income.toFixed(0)}
              </div>
            )}
          </div>
        </div>

        <DistrictChart records={records} />
      </div>
    </Layout>
  )
}
