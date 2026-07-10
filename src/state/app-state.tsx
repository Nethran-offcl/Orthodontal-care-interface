import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '@/data/types'

interface AppStateValue {
  role: Role
  setRole: (role: Role) => void
  currentDoctorId: string
  setCurrentDoctorId: (id: string) => void
  currentPatientId: string
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('doctor')
  const [currentDoctorId, setCurrentDoctorId] = useState('doc-rao')
  const [currentPatientId] = useState('PT-1002')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <AppStateContext.Provider
      value={{
        role,
        setRole,
        currentDoctorId,
        setCurrentDoctorId,
        currentPatientId,
        commandPaletteOpen,
        setCommandPaletteOpen,
        notificationsOpen,
        setNotificationsOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
