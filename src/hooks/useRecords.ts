import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Record } from '../types'

export function normalizeTime(time: string): string {
  if (!time) return ''
  
  let cleaned = time.trim()
  
  cleaned = cleaned.replace(/[.\-\/]/g, ':')
  
  const parts = cleaned.split(':')
  if (parts.length === 2) {
    let hours = parseInt(parts[0], 10)
    let minutes = parseInt(parts[1], 10)
    
    if (isNaN(hours) || isNaN(minutes)) return ''
    
    if (hours < 0 || hours > 23) return ''
    if (minutes < 0 || minutes > 59) minutes = 0
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
  
  return ''
}

export function calculateHours(start: string, end: string): number {
  const normalizedStart = normalizeTime(start)
  const normalizedEnd = normalizeTime(end)
  
  if (!normalizedStart || !normalizedEnd) return 0
  
  const [sh, sm] = normalizedStart.split(':').map(Number)
  const [eh, em] = normalizedEnd.split(':').map(Number)
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  let diff = endMinutes - startMinutes
  if (diff <= 0) diff += 24 * 60
  return diff / 60
}

export function useRecords() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setRecords([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err) {
      console.error('Failed to fetch records:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  async function addRecord(record: Omit<Record, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'hourly_rate'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const hours = calculateHours(record.start_time, record.end_time)
      const netIncome = record.income - (record.repair_fee || 0)
      const hourlyRate = hours > 0 ? Math.round((netIncome / hours) * 100) / 100 : 0

      const newRecord = {
        ...record,
        user_id: user.id,
        hourly_rate: hourlyRate,
      }

      const { data, error } = await supabase
        .from('records')
        .insert(newRecord)
        .select()
        .single()

      if (error) throw error
      setRecords(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Failed to add record:', err)
      throw err
    }
  }

  async function updateRecord(id: string, updates: Partial<Record>) {
    try {
      const record = records.find(r => r.id === id)
      if (!record) throw new Error('Record not found')

      const newStart = updates.start_time ?? record.start_time
      const newEnd = updates.end_time ?? record.end_time
      const newIncome = updates.income ?? record.income
      const newRepairFee = updates.repair_fee ?? record.repair_fee
      const hours = calculateHours(newStart, newEnd)
      const netIncome = newIncome - newRepairFee
      const hourlyRate = hours > 0 ? Math.round((netIncome / hours) * 100) / 100 : 0

      const payload = { ...updates, hourly_rate: hourlyRate }

      const { error } = await supabase
        .from('records')
        .update(payload)
        .eq('id', id)

      if (error) throw error

      setRecords(prev => prev.map(r => r.id === id ? { ...r, ...payload } : r))
    } catch (err) {
      console.error('Failed to update record:', err)
      throw err
    }
  }

  async function deleteRecord(id: string) {
    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id)

      if (error) throw error
      setRecords(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('Failed to delete record:', err)
      throw err
    }
  }

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords,
  }
}
