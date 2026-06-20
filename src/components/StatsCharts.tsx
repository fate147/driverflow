import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ChartData {
  date: string
  income: number
  hourlyRate: number
}

interface StatsChartsProps {
  data: ChartData[]
}

export default function StatsCharts({ data }: StatsChartsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-4">每日流水趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#999" tick={{ fill: '#999', fontSize: 12 }} />
            <YAxis stroke="#999" tick={{ fill: '#999', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="income" stroke="#667eea" strokeWidth={2} dot={{ fill: '#667eea', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-4">时薪变化趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#999" tick={{ fill: '#999', fontSize: 12 }} />
            <YAxis stroke="#999" tick={{ fill: '#999', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="hourlyRate" stroke="#3fb950" strokeWidth={2} dot={{ fill: '#3fb950', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
