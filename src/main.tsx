import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#151C2C',
            color: '#F3F4F6',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
        }} 
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
