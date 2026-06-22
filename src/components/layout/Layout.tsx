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
    <div className="min-h-[100dvh] bg-background flex flex-col md:items-center md:justify-center md:p-8">
      <div className="w-full max-w-5xl md:relative z-10 flex flex-col min-h-[100dvh] md:bg-card md:rounded-2xl md:shadow-xl md:min-h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b shrink-0">
          <h1 className="text-base md:text-lg font-bold text-card-foreground">DriverFlow</h1>
          <span className="text-xs text-muted-foreground font-medium">在线</span>
        </div>
        <div className="p-4 sm:p-5 md:p-6 flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-6">
          {children}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}>
        <div className="bg-card/95 backdrop-blur-md border-t md:border md:rounded-full px-2 py-2 md:px-3 md:py-2 flex items-center justify-around md:justify-start gap-0.5 md:gap-1 shadow-xl md:w-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col md:flex-row items-center justify-center rounded-full transition-all duration-200",
                  "flex-1 md:flex-none w-auto h-12 md:w-auto md:h-auto md:px-4 md:py-2.5 md:gap-2",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-sm md:font-medium mt-0.5 md:mt-0">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
