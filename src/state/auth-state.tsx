import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '@/data/types'

interface StoredAuth {
  role: Role
  userId: string
}

interface AuthValue {
  isAuthenticated: boolean
  role: Role | null
  userId: string | null
  login: (role: Role, userId: string) => void
  logout: () => void
}

const STORAGE_KEY = 'sunrise-auth'

const AuthContext = createContext<AuthValue | null>(null)

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => readStoredAuth())

  useEffect(() => {
    if (auth) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [auth])

  function login(role: Role, userId: string) {
    setAuth({ role, userId })
  }

  function logout() {
    setAuth(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!auth,
        role: auth?.role ?? null,
        userId: auth?.userId ?? null,
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
