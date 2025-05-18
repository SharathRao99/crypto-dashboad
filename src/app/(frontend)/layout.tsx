import React from 'react'
import './global.css'
import { Toaster } from 'sonner'
import { Providers } from './provider'

export const metadata = {
  description: 'A crypto investment platform',
  title: 'Crypto Investment Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
