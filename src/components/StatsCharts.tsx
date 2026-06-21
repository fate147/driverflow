import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ChartData {
  date: string
  income: number
  hourlyRate?: number
}

interface StatsChartsProps {
  data: ChartData[]
  type?: 'bar' | 'area'
}

export default function StatsCharts({ data, type = 'bar' }: StatsChartsProps) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'oklch(0.205 0 0)',
      border: '1px solid oklch(1 0 0 / 10%)',
      borderRadius: '8px',
      color: 'oklch(0.985 0 0)'
    }
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 10%)" />
          <XAxis dataKey="date" stroke="oklch(0.708 0 0)" tick={{ fill: 'oklch(0.708 0 0)', fontSize: 12 }} />
          <YAxis stroke="oklch(0.708 0 0)" tick={{ fill: 'oklch(0.708 0 0)', fontSize: 12 }} />
          <Tooltip {...tooltipStyle} />
          <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} fill="url(#colorIncome)" />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 10%)" />
        <XAxis dataKey="date" stroke="oklch(0.708 0 0)" tick={{ fill: 'oklch(0.708 0 0)', fontSize: 12 }} />
        <YAxis stroke="oklch(0.708 0 0)" tick={{ fill: 'oklch(0.708 0 0)', fontSize: 12 }} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
