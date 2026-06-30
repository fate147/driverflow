import { useMemo } from 'react'
import { useRecords } from '../hooks/useRecords'

export function useRepair() {
  const { records, loading } = useRecords()

  const repairRecords = useMemo(() => {
    return records
      .filter(r => r.repair_fee > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [records])

  const totalRepairFee = useMemo(() => {
    return records.reduce((sum, r) => sum + r.repair_fee, 0)
  }, [records])

  return {
    records,
    loading,
    repairRecords,
    totalRepairFee,
  }
}
