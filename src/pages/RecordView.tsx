import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { DISTRICTS } from '../lib/constants'
import { useRecordPage } from './useRecordPage'

export default function RecordView() {
  const {
    navigate,
    isEdit,
    form,
    selectedDistricts,
    districtSearch,
    setDistrictSearch,
    filteredDistricts,
    hours,
    hourlyRate,
    submitting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSubmit,
    handleDelete,
    handleChange,
    handleTimeBlur,
    toggleDistrict,
  } = useRecordPage()

  return (
    <Layout>
      <div style={{
        maxWidth: '576px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} style={{ width: '36px', height: '36px' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
          </button>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--c-text)',
            margin: 0,
          }}>{isEdit ? '编辑记录' : '新增记录'}</h2>
        </div>

        <div className="card">
          <div className="card-header" style={{ paddingBottom: 'var(--space-3)' }}>
            <div className="card-title" style={{ fontSize: 'var(--font-size-sm)' }}>
              {isEdit ? '修改记录信息' : '填写今日数据'}
            </div>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: 'var(--font-size-sm)' }}>日期</label>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: 'var(--font-size-sm)' }}>流水 (元)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  placeholder="请输入今日流水"
                  value={form.income}
                  onChange={(e) => handleChange('income', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="input-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className="input-label" style={{ fontSize: 'var(--font-size-xs)' }}>出车时间</label>
                    <button
                      type="button"
                      onClick={() => handleChange('start_time', '07:30')}
                      style={{
                        fontSize: '10px',
                        color: 'var(--c-text-secondary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)' }}
                    >默认</button>
                  </div>
                  <input
                    type="text"
                    className="input"
                    placeholder="7:30"
                    value={form.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                    onBlur={(e) => handleTimeBlur('start_time', e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className="input-label" style={{ fontSize: 'var(--font-size-xs)' }}>收车时间</label>
                    <button
                      type="button"
                      onClick={() => handleChange('end_time', '18:00')}
                      style={{
                        fontSize: '10px',
                        color: 'var(--c-text-secondary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)' }}
                    >默认</button>
                  </div>
                  <input
                    type="text"
                    className="input"
                    placeholder="18:00"
                    value={form.end_time}
                    onChange={(e) => handleChange('end_time', e.target.value)}
                    onBlur={(e) => handleTimeBlur('end_time', e.target.value)}
                    required
                  />
                </div>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--c-text-secondary)', margin: 0 }}>
                支持格式：7:30、07:30、7.30
              </p>

              <div className="input-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="input-label" style={{ fontSize: 'var(--font-size-xs)' }}>跑车区域</label>
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = selectedDistricts.length === DISTRICTS.length
                      toggleDistrict('')
                      if (allSelected) {
                        selectedDistricts.forEach(d => {
                          toggleDistrict(d)
                        })
                      } else {
                        DISTRICTS.forEach(d => {
                          if (!selectedDistricts.includes(d)) {
                            toggleDistrict(d)
                          }
                        })
                      }
                    }}
                    style={{
                      fontSize: '10px',
                      color: 'var(--c-text-secondary)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)' }}
                  >
                    {selectedDistricts.length === DISTRICTS.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <input
                  className="input"
                  placeholder="搜索区域..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  style={{ height: '32px', fontSize: 'var(--font-size-xs)' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {filteredDistricts.map(district => (
                    <button
                      key={district}
                      type="button"
                      onClick={() => toggleDistrict(district)}
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        transition: 'all var(--transition-fast)',
                        cursor: 'pointer',
                        border: 'none',
                        background: selectedDistricts.includes(district) ? 'var(--c-primary)' : 'var(--c-bg-secondary)',
                        color: selectedDistricts.includes(district) ? 'white' : 'var(--c-text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedDistricts.includes(district)) {
                          e.currentTarget.style.opacity = '0.8'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      {district}
                    </button>
                  ))}
                  {filteredDistricts.length === 0 && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--c-text-secondary)', margin: 0 }}>无匹配区域</p>
                  )}
                </div>
                {selectedDistricts.length > 0 && (
                  <p style={{ fontSize: '10px', color: 'var(--c-text-secondary)', margin: 0 }}>
                    已选：{selectedDistricts.join('、')}
                  </p>
                )}
              </div>

              <div className="input-group">
                <label className="input-label" style={{ fontSize: 'var(--font-size-sm)' }}>修车费 (元)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  placeholder="0"
                  value={form.repair_fee}
                  onChange={(e) => handleChange('repair_fee', e.target.value)}
                />
              </div>

              {(form.start_time && form.end_time) && hours > 0 && (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--c-bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ color: 'var(--c-text-secondary)' }}>出车时长</span>
                    <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--c-text)' }}>{hours.toFixed(1)} 小时</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ color: 'var(--c-text-secondary)' }}>时薪</span>
                    <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--c-text)' }}>¥{hourlyRate.toFixed(2)} / 小时</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !form.income || !form.start_time || !form.end_time}
                style={{ width: '100%' }}
              >
                {submitting ? '保存中...' : isEdit ? '保存修改' : '保存记录'}
              </button>
            </form>
          </div>
        </div>

        {isEdit && (
          <>
            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%' }}>
              <Trash2 style={{ width: '16px', height: '16px', marginRight: 'var(--space-2)' }} />
              删除记录
            </button>

            {showDeleteConfirm && (
              <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-4)',
              }}>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'var(--c-overlay-bg, rgba(0, 0, 0, 0.5))',
                    backdropFilter: 'blur(4px)',
                  }}
                  onClick={() => setShowDeleteConfirm(false)}
                />
                <div className="card" style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: 'var(--space-6)',
                  maxWidth: '400px',
                  width: '100%',
                  boxShadow: 'var(--shadow-xl)',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 'var(--space-4)',
                  }}>
                    <div style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-danger-50, rgba(239, 68, 68, 0.1))',
                    }}>
                      <AlertCircle style={{ width: '24px', height: '24px', color: 'var(--c-danger)' }} />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--c-text)',
                        margin: 0,
                      }}>确认删除</h3>
                      <p style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--c-text-secondary)',
                        marginTop: 'var(--space-1)',
                        marginBottom: 0,
                      }}>此操作无法撤销，确定要删除这条记录吗？</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                    <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>取消</button>
                    <button className="btn btn-danger" onClick={handleDelete} style={{ flex: 1 }}>确认删除</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
