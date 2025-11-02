import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ToastProvider, ToastContainer } from '../components/Toast'

const queryClient = new QueryClient()

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