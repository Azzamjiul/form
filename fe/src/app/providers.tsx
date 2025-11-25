import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ToastProvider, ToastContainer } from '../components/Toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,      // Don't refetch on window focus
      refetchOnReconnect: false,        // Don't refetch on reconnect
      retry: 1,                         // Only retry once
    },
  },
})

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>
  )
}