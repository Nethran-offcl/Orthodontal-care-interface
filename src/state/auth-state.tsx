import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '@/types'
import { authService } from '@/services'
import { supabase } from '@/lib/supabase'

interface AuthValue {
  isAuthenticated: boolean
  role: Role | null
  userId: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ role: Role; userId: string } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true

    authService.getSession().then((s) => {
      if (!alive) return
      setSession(s)
      setReady(true)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (!alive) return
      if (event === 'SIGNED_OUT') {
        setSession(null)
        return
      }
      authService.getSession().then((s) => {
        if (alive) setSession(s)
      })
    })

    return () => {
      alive = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function login(email: string, password: string) {
    const s = await authService.login(email, password)
    setSession(s)
  }

  function logout() {
    setSession(null)
    void authService.logout()
  }

  if (!ready) return null

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        role: session?.role ?? null,
        userId: session?.userId ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
