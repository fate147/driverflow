import { ReactNode, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Plus, BarChart3 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ShortcutsHint } from '../ShortcutsHint'

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key.toLowerCase()) {
        case 'h': navigate('/'); break
        case 'n': navigate('/record'); break
        case 's': navigate('/stats'); break
        case 'escape': navigate(-1); break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:items-center md:justify-center md:p-8">
      <div className="w-full max-w-5xl md:relative z-10 flex flex-col min-h-[100dvh] md:bg-card md:rounded-2xl md:shadow-xl md:min-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b shrink-0">
          <h1 className="text-base md:text-lg font-bold text-card-foreground">DriverFlow</h1>
          {/* Desktop: nav in header */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
          <span className="text-xs text-muted-foreground font-medium md:hidden">在线</span>
        </div>

        <div className="p-4 sm:p-5 md:p-6 flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-6">
          {children}
        </div>
      </div>

      {/* Mobile: bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}>
        <div className="bg-card/95 backdrop-blur-md border-t px-2 py-2 flex items-center justify-around">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-full transition-all duration-200 flex-1 h-12",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <ShortcutsHint />
    </div>
  )
}
