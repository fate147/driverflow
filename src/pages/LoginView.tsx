import { useLogin } from './useLogin'

export default function LoginView() {
  const {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    message,
    handleSubmit,
    toggleMode,
  } = useLogin()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--c-bg)',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}>
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--c-text)',
            margin: 0,
          }}>DriverFlow</h1>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--c-text-secondary)',
            margin: 0,
          }}>司机流水宝 - 让数据驱动收入</p>
        </div>

        <div className="card">
          <div className="card-header" style={{ paddingBottom: 'var(--space-3)' }}>
            <div className="card-title" style={{ fontSize: 'var(--font-size-base)' }}>
              {isLogin ? '登录' : '注册'}
            </div>
            <div className="card-description" style={{ fontSize: 'var(--font-size-sm)' }}>
              {isLogin ? '请输入您的账号信息' : '创建一个新账号'}
            </div>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: 'var(--font-size-sm)' }}>邮箱</label>
                <input
                  type="email"
                  className="input"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: 'var(--font-size-sm)' }}>密码</label>
                <input
                  type="password"
                  className="input"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {error}
                </div>
              )}
              {message && (
                <div className="alert alert-info" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
              </button>
            </form>

            <div style={{
              marginTop: 'var(--space-4)',
              textAlign: 'center',
            }}>
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--c-text-secondary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--c-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--c-text-secondary)'
                }}
              >
                {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
