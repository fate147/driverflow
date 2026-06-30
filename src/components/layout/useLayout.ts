import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Plus, BarChart3 } from 'lucide-react'

export function useLayout() {
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

  return {
    navItems,
    isActive,
    navigate,
  }
}
