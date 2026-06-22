import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/', { replace: true })
    })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/', { replace: true })
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('注册成功！请检查邮箱验证。')
      }
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-6">
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">DriverFlow</h1>
          <p className="text-muted-foreground text-sm">司机流水宝 - 让数据驱动收入</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">{isLogin ? '登录' : '注册'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isLogin ? '请输入您的账号信息' : '创建一个新账号'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">邮箱</Label>
                <Input type="email" placeholder="请输入邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">密码</Label>
                <Input type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs sm:text-sm">{error}</div>
              )}
              {message && (
                <div className="p-3 rounded-lg bg-muted text-foreground text-xs sm:text-sm">{message}</div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setMessage('') }} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
