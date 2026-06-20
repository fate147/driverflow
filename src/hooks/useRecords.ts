import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Record } from '../types'

export function calculateHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  const diff = endMinutes - startMinutes
  return diff > 0 ? diff / 60 : 0
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
      const hourlyRate = hours > 0 ? Math.round((record.income / hours) * 100) / 100 : 0

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
      const { error } = await supabase
        .from('records')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      if (updates.start_time || updates.end_time || updates.income) {
        const record = records.find(r => r.id === id)
        if (record) {
          const newStart = updates.start_time || record.start_time
          const newEnd = updates.end_time || record.end_time
          const newIncome = updates.income ?? record.income
          const hours = calculateHours(newStart, newEnd)
          const hourlyRate = hours > 0 ? Math.round((newIncome / hours) * 100) / 100 : 0
          updates.hourly_rate = hourlyRate
        }
      }

      setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
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
