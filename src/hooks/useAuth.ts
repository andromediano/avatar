import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)

  return { isLoggedIn, user, login, logout }
}
