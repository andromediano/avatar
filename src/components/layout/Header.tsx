import { useAuthStore } from '../../store/authStore'

export function Header() {
  const { isLoggedIn, user, logout } = useAuthStore()

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
        height: 48,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
        3D Virtual Fitting
      </h1>
      <div>
        {isLoggedIn ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>{user?.nickname ?? user?.email}</span>
            <button onClick={logout} style={{ fontSize: 12, cursor: 'pointer' }}>
              로그아웃
            </button>
          </span>
        ) : (
          <button style={{ fontSize: 12, cursor: 'pointer' }}>로그인</button>
        )}
      </div>
    </header>
  )
}
