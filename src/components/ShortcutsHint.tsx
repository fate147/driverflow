import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'

const shortcuts = [
  { key: 'H', desc: '回到首页' },
  { key: 'N', desc: '新增记录' },
  { key: 'S', desc: '数据统计' },
  { key: 'Esc', desc: '返回上一页' },
  { key: '?', desc: '显示/隐藏此面板' },
]

export function ShortcutsHint() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === '?') setOpen(prev => !prev)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 p-2 rounded-full bg-card border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-lg md:hidden"
        title="快捷键"
      >
        <Keyboard className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-card border rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                键盘快捷键
              </h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.map(s => (
                <div key={s.key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-muted-foreground">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono font-medium text-foreground border">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">输入框中自动屏蔽</p>
          </div>
        </div>
      )}
    </>
  )
}
