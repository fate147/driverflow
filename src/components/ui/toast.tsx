import { useState, createContext, useContext, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  action?: { label: string; onClick: () => void }
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', action?: { label: string; onClick: () => void }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', action?: { label: string; onClick: () => void }) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, action }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getIcon = (type?: 'success' | 'error' | 'info' | 'warning') => {
    switch (type) {
      case 'error':
        return <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0, color: 'var(--c-danger)' }} />
      case 'warning':
        return <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0, color: 'var(--c-warning)' }} />
      case 'info':
        return <Info style={{ width: '18px', height: '18px', flexShrink: 0, color: 'var(--c-primary)' }} />
      default:
        return <CheckCircle style={{ width: '18px', height: '18px', flexShrink: 0, color: 'var(--c-success)' }} />
    }
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: 'var(--space-4)',
        right: 'var(--space-4)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type || 'success'}`}
          >
            <span className="toast-icon">
              {getIcon(toast.type)}
            </span>
            <span className="toast-message">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => { toast.action!.onClick(); removeToast(toast.id) }}
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--c-primary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
