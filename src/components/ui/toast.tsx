import { useState, createContext, useContext, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  action?: { label: string; onClick: () => void }
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info', action?: { label: string; onClick: () => void }) => void
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

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', action?: { label: string; onClick: () => void }) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, action }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center gap-3",
              "bg-card border text-card-foreground min-w-[280px]"
            )}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
            ) : (
              <CheckCircle className={cn(
                "h-4 w-4 flex-shrink-0",
                toast.type === 'success' && "text-green-500",
                toast.type === 'info' && "text-blue-500"
              )} />
            )}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => { toast.action!.onClick(); removeToast(toast.id) }}
                className="text-xs font-medium text-primary hover:underline flex-shrink-0"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
