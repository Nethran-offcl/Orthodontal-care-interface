import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AppStateProvider } from '@/state/app-state'
import { ClinicStoreProvider } from '@/state/store'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ClinicStoreProvider>
      <AppStateProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster />
        </TooltipProvider>
      </AppStateProvider>
    </ClinicStoreProvider>
  )
}
