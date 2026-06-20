import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import RecordPage from './pages/Record'
import Stats from './pages/Stats'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setAuthenticated(!!data.session)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/record"
        element={
          <ProtectedRoute>
            <RecordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/record/:id"
        element={
          <ProtectedRoute>
            <RecordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <Stats />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
