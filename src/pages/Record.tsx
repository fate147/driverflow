import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useRecords, calculateHours } from '../hooks/useRecords'


export default function RecordPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { records, addRecord, updateRecord, deleteRecord } = useRecords()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    income: '',
    start_time: '',
    end_time: '',
    repair_fee: '0',
  })
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      }
    }
  }, [isEdit, id, records])

  const hours = form.start_time && form.end_time
    ? calculateHours(form.start_time, form.end_time)
    : 0
  const incomeNum = parseFloat(form.income) || 0
  const repairNum = parseFloat(form.repair_fee) || 0
  const netIncome = incomeNum - repairNum
  const hourlyRate = hours > 0 ? Math.round((netIncome / hours) * 100) / 100 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.income || !form.start_time || !form.end_time) return

    setSubmitting(true)
    try {
      const payload = {
        date: form.date,
        income: parseFloat(form.income),
        start_time: form.start_time,
        end_time: form.end_time,
        repair_fee: parseFloat(form.repair_fee) || 0,
      }

      if (isEdit && id) {
        await updateRecord(id, payload)
      } else {
        await addRecord(payload)
      }
      navigate('/')
    } catch {
      // error handling via toast would go here
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await deleteRecord(id)
      navigate('/')
    } catch {
      // error handling
    }
  }

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? '编辑记录' : '新增记录'}
          </h1>
        </div>

        {/* Form Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date */}
            <Input
              label="日期"
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />

            {/* Income */}
            <Input
              label="流水 (元)"
              type="number"
              step="0.01"
              min="0"
              placeholder="请输入今日流水"
              value={form.income}
              onChange={(e) => handleChange('income', e.target.value)}
              required
            />

            {/* Start & End Time */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="出车时间"
                type="time"
                value={form.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                required
              />
              <Input
                label="收车时间"
                type="time"
                value={form.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                required
              />
            </div>

            {/* Repair Fee */}
            <Input
              label="修车费 (元)"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              placeholder="0"
              value={form.repair_fee}
              onChange={(e) => handleChange('repair_fee', e.target.value)}
            />

            {/* Preview */}
            {(form.start_time && form.end_time) && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">出车时长</span>
                  <span className="text-white font-medium">{hours.toFixed(1)} 小时</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">时薪</span>
                  <span className="text-primary font-medium">
                    ¥{hourlyRate.toFixed(2)} / 小时
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !form.income || !form.start_time || !form.end_time}
            >
              {submitting ? '保存中...' : isEdit ? '保存修改' : '保存记录'}
            </Button>
          </form>
        </Card>

        {/* Delete Button (Edit Mode) */}
        {isEdit && (
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除记录
            </Button>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                />
                <div className="relative bg-surface border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">确认删除</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        此操作无法撤销，确定要删除这条记录吗？
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      确认删除
                    </Button>
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
