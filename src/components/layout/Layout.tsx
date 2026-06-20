import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Plus, BarChart3, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

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
    <div className="min-h-screen bg-dark">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-dark/80 backdrop-blur-xl border-r border-white/10">
          <div className="flex flex-col flex-grow pt-8 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DriverFlow
              </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white/10 text-primary'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
            <div className="px-4 pb-8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">退出</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-t border-white/10">
          <div className="flex justify-around items-center py-3">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                    isActive(item.path) ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-gray-400 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-medium">退出</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="md:ml-64 flex-1 pb-24 md:pb-8">
          <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
