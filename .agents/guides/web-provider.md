# Guide: Web Provider (`apps/web/providers/`)

## Kontrak Folder

✅ Boleh:
- React Context provider wrappers
- Global state yang perlu di-share antar komponen (theme, auth session, toast, dll.)
- Wrap library provider (ReactQueryProvider, ThemeProvider, dll.)

❌ Dilarang:
- Business logic
- API call langsung
- UI rendering yang tidak berkaitan dengan provide context

---

## Konvensi

### Root Provider

```tsx
// providers/app-providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000 },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

### Custom Context Provider

```tsx
// providers/sidebar-provider.tsx
'use client'

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface SidebarContextValue {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <SidebarContext.Provider value={{ isOpen, toggle: () => setIsOpen((v) => !v) }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
```

---

## Aturan Tambahan

- Provider root (`app-providers.tsx`) diimport di `app/layout.tsx`
- Custom context hook (`useSidebar`) selalu export bareng providernya
- File diakhiri newline
