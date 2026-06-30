import { TrendingUp, Clock, Wallet, Wrench, ChevronLeft, ChevronRight, Edit, Plus, Search, Download } from 'lucide-react'
import { format } from 'date-fns'
import Layout from '../components/layout/Layout'
import DistrictChart from '../components/DistrictChart'
import StatsCharts from '../components/StatsCharts'
import { useStats } from './useStats'

export default function StatsView() {
  const {
    navigate,
    records,
    loading,
    period,
    periodLabel,
    recordSearch,
    setRecordSearch,
    stats,
    periodBarData,
    filteredDailyData,
    filteredRecords,
    chartTitle,
    handlePeriodChange,
    navigatePeriod,
    exportCSV,
  } = useStats()

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card">
                <div className="card-content" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div className="skeleton skeleton-text" style={{ width: '64px' }}></div>
                  <div className="skeleton" style={{ height: '24px', width: '96px' }}></div>
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
          className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--c-text)',
              margin: 0,
            }}>数据统计</h2>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--c-text-secondary)',
              margin: 'var(--space-1) 0 0 0',
            }}>查看收入数据分析</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button className="btn btn-outline btn-sm" onClick={exportCSV} style={{ fontSize: 'var(--font-size-xs)' }}>
              <Download style={{ width: '14px', height: '14px', marginRight: 'var(--space-1)' }} />
              导出
            </button>
            <button className="btn btn-ghost btn-icon" onClick={() => navigatePeriod('prev')} style={{ width: '32px', height: '32px' }}>
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
            </button>
            <span style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              minWidth: '100px',
              textAlign: 'center',
              color: 'var(--c-text)',
            }}>{periodLabel}</span>
            <button className="btn btn-ghost btn-icon" onClick={() => navigatePeriod('next')} style={{ width: '32px', height: '32px' }}>
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {(['week', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              className={period === p ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
              onClick={() => handlePeriodChange(p)}
              style={{ fontSize: 'var(--font-size-xs)' }}
            >
              {p === 'week' ? '周' : p === 'month' ? '月' : '年'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}
          className="lg:grid-cols-4">
          <div className="card" style={{
            background: 'var(--c-bg-secondary)',
            border: '1px solid var(--c-border)',
          }}>
            <div className="card-header" style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 'var(--space-2)',
            }}>
              <div className="card-title" style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--c-primary)',
                opacity: 0.8,
              }}>总流水</div>
              <Wallet style={{ width: '16px', height: '16px', color: 'var(--c-primary)' }} />
            </div>
            <div className="card-content" style={{ padding: 'var(--space-3) var(--space-6)' }}>
              <div style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-black)',
                color: 'var(--c-primary)',
                letterSpacing: '-0.025em',
              }}>¥{stats.totalIncome.toFixed(2)}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 'var(--space-2)',
            }}>
              <div className="card-title" style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--c-text-secondary)',
              }}>总时长</div>
              <Clock style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            </div>
            <div className="card-content" style={{ padding: 'var(--space-3) var(--space-6)' }}>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--c-text)',
              }}>{stats.totalHours.toFixed(1)}h</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 'var(--space-2)',
            }}>
              <div className="card-title" style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--c-text-secondary)',
              }}>时薪</div>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            </div>
            <div className="card-content" style={{ padding: 'var(--space-3) var(--space-6)' }}>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--c-text)',
              }}>¥{stats.avgHourlyRate.toFixed(2)}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 'var(--space-2)',
            }}>
              <div className="card-title" style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--c-text-secondary)',
              }}>修车费</div>
              <Wrench style={{ width: '16px', height: '16px', color: '#f97316' }} />
            </div>
            <div className="card-content" style={{ padding: 'var(--space-3) var(--space-6)' }}>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: '#f97316',
              }}>¥{stats.totalRepairFee.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card">
            <div className="card-header" style={{ paddingBottom: 'var(--space-2)' }}>
              <div className="card-title" style={{ fontSize: 'var(--font-size-sm)' }}>{chartTitle}</div>
            </div>
            <div className="card-content">
              {periodBarData.some(d => d.income > 0) ? (
                <StatsCharts data={periodBarData} />
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-8) 0',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--c-text-secondary)', margin: '0 0 var(--space-3) 0' }}>暂无数据</p>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/record')}>
                    <Plus style={{ width: '16px', height: '16px', marginRight: 'var(--space-1)' }} />
                    添加记录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DistrictChart records={records} />

        <div className="card">
          <div className="card-header" style={{ paddingBottom: 'var(--space-2)' }}>
            <div className="card-title" style={{ fontSize: 'var(--font-size-sm)' }}>
              {period === 'year' ? '每月数据' : '每日数据'}
            </div>
          </div>
          <div className="card-content">
            {filteredDailyData.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-8) 0',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--c-text-secondary)', margin: '0 0 var(--space-3) 0' }}>该周期暂无记录</p>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/record')}>
                  <Plus style={{ width: '16px', height: '16px', marginRight: 'var(--space-1)' }} />
                  添加记录
                </button>
              </div>
            ) : (
              <>
                <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
                  <Search style={{
                    position: 'absolute',
                    left: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    color: 'var(--c-text-muted)',
                  }} />
                  <input
                    className="input"
                    placeholder="搜索日期、时间、区域..."
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                    style={{ paddingLeft: '36px', height: '32px', fontSize: 'var(--font-size-xs)' }}
                  />
                </div>
                <div className="accordion">
                  {filteredDailyData.map((day, index) => (
                    <div key={day.date} className="accordion-item" data-state={index === 0 ? 'open' : 'closed'} data-value={day.date}>
                      <button
                        type="button"
                        className="accordion-trigger"
                        onClick={(e) => {
                          const item = (e.currentTarget as HTMLElement).closest('.accordion-item')
                          if (item) {
                            const isOpen = item.getAttribute('data-state') === 'open'
                            item.setAttribute('data-state', isOpen ? 'closed' : 'open')
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          gap: 'var(--space-2)',
                        }}>
                          <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>{day.displayDate}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>¥{day.income.toFixed(2)}</span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--c-text-secondary)' }}>{day.records.length}条</span>
                          </div>
                        </div>
                      </button>
                      <div className="accordion-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 'var(--space-4)',
                            fontSize: 'var(--font-size-xs)',
                          }}>
                            <div>
                              <p style={{ color: 'var(--c-text-secondary)', margin: 0 }}>时长</p>
                              <p style={{ fontWeight: 'var(--font-weight-medium)', margin: 'var(--space-1) 0 0 0' }}>{day.hours.toFixed(1)}h</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--c-text-secondary)', margin: 0 }}>时薪</p>
                              <p style={{ fontWeight: 'var(--font-weight-medium)', margin: 'var(--space-1) 0 0 0' }}>¥{day.hourlyRate.toFixed(2)}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--c-text-secondary)', margin: 0 }}>修车费</p>
                              <p style={{
                                fontWeight: 'var(--font-weight-medium)',
                                margin: 'var(--space-1) 0 0 0',
                                color: day.repairFee > 0 ? '#f97316' : 'var(--c-text)',
                              }}>¥{day.repairFee.toFixed(2)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {day.records.map((record) => (
                              <div key={record.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-2)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--c-bg-secondary)',
                                gap: 'var(--space-2)',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0, flex: 1 }}>
                                  <span style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--c-text-secondary)',
                                    whiteSpace: 'nowrap',
                                  }}>{record.start_time}-{record.end_time}</span>
                                  <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                  }}>¥{record.income.toFixed(2)}</span>
                                </div>
                                <button
                                  className="btn btn-ghost btn-icon"
                                  onClick={() => navigate(`/record/${record.id}`)}
                                  style={{ width: '24px', height: '24px', flexShrink: 0, padding: 0 }}
                                >
                                  <Edit style={{ width: '12px', height: '12px' }} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredDailyData.length === 0 && recordSearch && (
                  <p style={{ textAlign: 'center', color: 'var(--c-text-secondary)', padding: 'var(--space-6) 0', fontSize: 'var(--font-size-sm)', margin: 0 }}>无匹配记录</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ paddingBottom: 'var(--space-2)' }}>
            <div className="card-title" style={{
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <Wrench style={{ width: '16px', height: '16px' }} />
              修车记录
            </div>
          </div>
          <div className="card-content">
            {filteredRecords.filter(r => r.repair_fee > 0).length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--c-text-secondary)', padding: 'var(--space-8) 0', fontSize: 'var(--font-size-sm)', margin: 0 }}>该周期暂无修车记录</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {filteredRecords
                  .filter(r => r.repair_fee > 0)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(record => (
                    <div key={record.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--c-bg-secondary)',
                      gap: 'var(--space-2)',
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{
                          fontWeight: 'var(--font-weight-medium)',
                          fontSize: 'var(--font-size-sm)',
                          margin: 0,
                          color: 'var(--c-text)',
                        }}>{format(new Date(record.date), period === 'year' ? 'M月dd日' : 'MM月dd日')}</p>
                        <p style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--c-text-secondary)',
                          margin: 'var(--space-1) 0 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {record.districts && record.districts.length > 0 ? record.districts.join('、') : '未选区域'}
                        </p>
                      </div>
                      <p style={{
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--c-danger)',
                        fontSize: 'var(--font-size-sm)',
                        flexShrink: 0,
                        margin: 0,
                      }}>¥{record.repair_fee.toFixed(2)}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
