import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Plus, BarChart3 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/record', label: '记录', icon: Plus },
    { path: '/stats', label: '统计', icon: BarChart3 },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="relative w-full max-w-5xl z-10">
        <div className="bg-card rounded-2xl shadow-xl min-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h1 className="text-lg font-bold text-card-foreground">DriverFlow</h1>
            <span className="text-xs text-muted-foreground font-medium">在线</span>
          </div>
          <div className="p-6 flex-1">
            {children}
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card border rounded-full px-2 py-2 flex items-center gap-1 shadow-xl">
            {navItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
