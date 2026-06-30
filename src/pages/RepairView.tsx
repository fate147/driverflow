import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Plus } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useRepair } from './useRepair'

export default function RepairView() {
  const { loading, repairRecords, totalRepairFee } = useRepair()

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: '576px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-content" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div className="skeleton skeleton-text" style={{ width: '64px' }}></div>
              <div className="skeleton" style={{ height: '32px', width: '112px' }}></div>
            </div>
          </div>
          <div className="card">
            <div className="card-content" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="skeleton skeleton-text" style={{ width: '96px' }}></div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '56px', width: '100%' }}></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: '576px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => window.history.back()}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--c-text)',
              margin: 0,
            }}>修车记录</h2>
          </div>
          <Link to="/record">
            <button className="btn btn-primary btn-sm">
              <Plus style={{ width: '16px', height: '16px', marginRight: 'var(--space-2)' }} />
              新增
            </button>
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">总修车费</div>
          </div>
          <div className="card-content">
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--c-danger)',
            }}>¥{totalRepairFee.toFixed(2)}</div>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--c-text-secondary)',
              marginTop: 'var(--space-1)',
              marginBottom: 0,
            }}>共 {repairRecords.length} 笔记录</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">修车记录明细</div>
          </div>
          <div className="card-content">
            {repairRecords.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: 'var(--c-text-secondary)',
                padding: 'var(--space-8) 0',
                fontSize: 'var(--font-size-sm)',
                margin: 0,
              }}>暂无修车记录</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {repairRecords.map(record => (
                  <Link key={record.id} to={`/record/${record.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--c-bg-secondary)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-tertiary)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-bg-secondary)' }}
                    >
                      <div>
                        <p style={{
                          fontWeight: 'var(--font-weight-medium)',
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--c-text)',
                          margin: 0,
                        }}>{format(new Date(record.date), 'MM月dd日')}</p>
                        <p style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--c-text-secondary)',
                          marginTop: 'var(--space-1)',
                          marginBottom: 0,
                        }}>
                          {record.districts && record.districts.length > 0
                            ? record.districts.join('、')
                            : '未选区域'}
                        </p>
                      </div>
                      <p style={{
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--c-danger)',
                        fontSize: 'var(--font-size-sm)',
                        margin: 0,
                      }}>¥{record.repair_fee.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
