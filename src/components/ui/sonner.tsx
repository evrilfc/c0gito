'use client'

import { Toaster as Sonner } from 'sonner'

const Toaster = () => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: '#1a0f2e',
          border: '2px solid #2d1b4e',
          color: '#e8e1f5',
        },
      }}
    />
  )
}

export { Toaster }
