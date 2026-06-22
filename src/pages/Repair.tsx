import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import Layout from '../components/layout/Layout'
import { useRecords } from '../hooks/useRecords'

export default function Repair() {
  const { records, loading } = useRecords()

  const repairRecords = useMemo(() => {
    return records
      .filter(r => r.repair_fee > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [records])

  const totalRepairFee = useMemo(() => {
    return records.reduce((sum, r) => sum + r.repair_fee, 0)
  }, [records])

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 max-w-xl mx-auto">
          <Card><CardContent className="p-4 space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-8 w-28" /></CardContent></Card>
          <Card><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-24" />{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</CardContent></Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">修车记录</h2>
          </div>
          <Link to="/record">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              新增
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>总修车费</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">¥{totalRepairFee.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">共 {repairRecords.length} 笔记录</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>修车记录明细</CardTitle>
          </CardHeader>
          <CardContent>
            {repairRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无修车记录</p>
            ) : (
              <div className="space-y-2">
                {repairRecords.map(record => (
                  <Link key={record.id} to={`/record/${record.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium">{format(new Date(record.date), 'MM月dd日')}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.districts && record.districts.length > 0
                            ? record.districts.join('、')
                            : '未选区域'}
                        </p>
                      </div>
                      <p className="font-medium text-destructive">¥{record.repair_fee.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
