import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { useRecords, calculateHours, normalizeTime } from '../hooks/useRecords'
import { useToast } from '../components/ui/toast'
import { DISTRICTS } from '../lib/constants'

export default function RecordPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { toast } = useToast()

  const { records, addRecord, updateRecord, deleteRecord } = useRecords()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    income: '',
    start_time: '',
    end_time: '',
    repair_fee: '0',
  })
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [districtSearch, setDistrictSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return DISTRICTS
    const q = districtSearch.trim().toLowerCase()
    return DISTRICTS.filter(d => d.toLowerCase().includes(q))
  }, [districtSearch])

  useEffect(() => {
    if (isEdit && records.length > 0) {
      const record = records.find(r => r.id === id)
      if (record) {
        setForm({
          date: record.date,
          income: String(record.income),
          start_time: record.start_time,
          end_time: record.end_time,
          repair_fee: String(record.repair_fee),
        })
        setSelectedDistricts(record.districts || [])
      }
    }
  }, [isEdit, id, records])

  const hours = form.start_time && form.end_time ? calculateHours(form.start_time, form.end_time) : 0
  const incomeNum = parseFloat(form.income) || 0
  const repairNum = parseFloat(form.repair_fee) || 0
  const hourlyRate = hours > 0 ? Math.round(((incomeNum - repairNum) / hours) * 100) / 100 : 0

  const doSubmit = async () => {
    const normalizedStart = normalizeTime(form.start_time)
    const normalizedEnd = normalizeTime(form.end_time)
    if (!normalizedStart || !normalizedEnd) {
      toast('请输入有效的时间格式（如 7:30 或 07.30）', 'error')
      return
    }
    const payload = {
      date: form.date,
      income: parseFloat(form.income),
      start_time: normalizedStart,
      end_time: normalizedEnd,
      repair_fee: parseFloat(form.repair_fee) || 0,
      districts: selectedDistricts,
    }
    if (isEdit && id) {
      await updateRecord(id, payload)
      toast('记录已更新', 'success')
    } else {
      await addRecord(payload)
      toast('记录已添加', 'success')
    }
    navigate('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.income || !form.start_time || !form.end_time) return
    setSubmitting(true)
    try {
      await doSubmit()
    } catch {
      toast('保存失败，网络可能不稳定', 'error', { label: '重试', onClick: doSubmit })
    } finally {
      setSubmitting(false)
    }
  }

  const doDelete = async () => {
    if (!id) return
    await deleteRecord(id)
    toast('记录已删除', 'success')
    navigate('/')
  }

  const handleDelete = async () => {
    try {
      await doDelete()
    } catch {
      toast('删除失败，网络可能不稳定', 'error', { label: '重试', onClick: doDelete })
    }
  }

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))
  const handleTimeBlur = (field: string, value: string) => {
    const normalized = normalizeTime(value)
    if (normalized) setForm(prev => ({ ...prev, [field]: normalized }))
  }

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    )
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl md:text-2xl font-bold">{isEdit ? '编辑记录' : '新增记录'}</h2>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base">{isEdit ? '修改记录信息' : '填写今日数据'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>日期</Label>
                <Input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>流水 (元)</Label>
                <Input type="number" step="0.01" min="0" placeholder="请输入今日流水" value={form.income} onChange={(e) => handleChange('income', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm">出车时间</Label>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, start_time: '07:30' }))} className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">默认</button>
                  </div>
                  <Input type="text" placeholder="7:30" value={form.start_time} onChange={(e) => handleChange('start_time', e.target.value)} onBlur={(e) => handleTimeBlur('start_time', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm">收车时间</Label>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, end_time: '18:00' }))} className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">默认</button>
                  </div>
                  <Input type="text" placeholder="18:00" value={form.end_time} onChange={(e) => handleChange('end_time', e.target.value)} onBlur={(e) => handleTimeBlur('end_time', e.target.value)} required />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">支持格式：7:30、07:30、7.30</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs sm:text-sm">跑车区域</Label>
                  <button type="button" onClick={() => setSelectedDistricts(prev => prev.length === DISTRICTS.length ? [] : [...DISTRICTS])} className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {selectedDistricts.length === DISTRICTS.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <Input
                  placeholder="搜索区域..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {filteredDistricts.map(district => (
                    <button key={district} type="button" onClick={() => toggleDistrict(district)} className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${selectedDistricts.includes(district) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {district}
                    </button>
                  ))}
                  {filteredDistricts.length === 0 && (
                    <p className="text-xs text-muted-foreground">无匹配区域</p>
                  )}
                </div>
                {selectedDistricts.length > 0 && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground">已选：{selectedDistricts.join('、')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>修车费 (元)</Label>
                <Input type="number" step="0.01" min="0" defaultValue="0" placeholder="0" value={form.repair_fee} onChange={(e) => handleChange('repair_fee', e.target.value)} />
              </div>

              {(form.start_time && form.end_time) && hours > 0 && (
                <div className="p-3 sm:p-4 rounded-lg bg-muted space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">出车时长</span>
                    <span className="font-medium">{hours.toFixed(1)} 小时</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">时薪</span>
                    <span className="font-medium">¥{hourlyRate.toFixed(2)} / 小时</span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting || !form.income || !form.start_time || !form.end_time}>
                {submitting ? '保存中...' : isEdit ? '保存修改' : '保存记录'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isEdit && (
          <>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              删除记录
            </Button>

            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                <div className="relative bg-card border rounded-xl p-6 max-w-sm w-full shadow-xl">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-destructive/10">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">确认删除</h3>
                      <p className="text-sm text-muted-foreground mt-1">此操作无法撤销，确定要删除这条记录吗？</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">取消</Button>
                    <Button variant="destructive" onClick={handleDelete} className="flex-1">确认删除</Button>
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
