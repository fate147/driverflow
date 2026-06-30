import { ReactNode } from 'react'
import { useLayout } from './useLayout'
import { ShortcutsHint } from '../ShortcutsHint'

interface LayoutViewProps {
  children: ReactNode
}

export default function LayoutView({ children }: LayoutViewProps) {
  const { navItems, isActive, navigate } = useLayout()

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--c-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1024px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        background: 'var(--c-bg)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--c-border)',
          flexShrink: 0,
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--c-text)',
          }}>DriverFlow</h1>

          {/* Desktop: nav in header */}
          <nav style={{ display: 'none', alignItems: 'center', gap: 'var(--space-1)' }}
            className="md:flex">
            {navItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                    border: 'none',
                    background: active ? 'var(--c-primary)' : 'transparent',
                    color: active ? 'white' : 'var(--c-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--c-bg-secondary)'
                      e.currentTarget.style.color = 'var(--c-text)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--c-text-secondary)'
                    }
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <span style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--c-text-muted)',
            fontWeight: 'var(--font-weight-medium)',
            display: 'block',
          }}
            className="md:hidden">在线</span>
        </div>

        <div style={{
          padding: 'var(--space-4)',
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
        }}
          className="md:pb-6">
          {children}
        </div>
      </div>

      {/* Mobile: bottom bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
        display: 'block',
      }}
        className="md:hidden">
        <div style={{
          background: 'var(--c-bg)',
          borderTop: '1px solid var(--c-border)',
          padding: 'var(--space-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all var(--transition-fast)',
                  flex: 1,
                  height: '48px',
                  cursor: 'pointer',
                  border: 'none',
                  background: active ? 'var(--c-primary)' : 'transparent',
                  color: active ? 'white' : 'var(--c-text-secondary)',
                  boxShadow: active ? 'var(--shadow-lg)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--c-bg-secondary)'
                    e.currentTarget.style.color = 'var(--c-text)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--c-text-secondary)'
                  }
                }}
              >
                <Icon style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '10px', marginTop: '2px' }}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <ShortcutsHint />
    </div>
  )
}
