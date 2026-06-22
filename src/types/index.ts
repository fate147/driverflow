export interface Record {
  id: string
  user_id: string
  date: string
  income: number
  start_time: string
  end_time: string
  repair_fee: number
  hourly_rate: number
  districts: string[] | null
  created_at: string
  updated_at: string
}

export interface DailySummary {
  date: string
  totalIncome: number
  totalHours: number
  avgHourlyRate: number
  totalRepairFee: number
}
