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
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8 flex items-center justify-center">
      <div className="relative w-full max-w-5xl z-10">
        <div className="bg-card rounded-2xl shadow-xl min-h-[88vh] sm:min-h-[85vh] md:min-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b">
            <h1 className="text-base md:text-lg font-bold text-card-foreground">DriverFlow</h1>
            <span className="text-xs text-muted-foreground font-medium">在线</span>
          </div>
          <div className="p-4 sm:p-5 md:p-6 flex-1 pb-20 md:pb-6">
            {children}
          </div>
        </div>

        <div className="fixed bottom-3 sm:bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card/90 backdrop-blur-md border rounded-full px-1.5 py-1.5 md:px-3 md:py-2 flex items-center gap-0.5 md:gap-1 shadow-xl">
            {navItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-200",
                    "w-10 h-10 sm:w-11 sm:h-11 md:w-auto md:h-auto md:px-4 md:py-2.5 md:gap-2",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5 md:h-4 md:w-4" />
                  <span className="hidden md:inline text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
