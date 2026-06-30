import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRecords, calculateHours, normalizeTime } from '../hooks/useRecords'
import { useToast } from '../components/ui/toast'
import { DISTRICTS } from '../lib/constants'

export function useRecordPage() {
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

  return {
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
  }
}
