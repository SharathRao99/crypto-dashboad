import Sidebar from '@/components/Sidebar'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  )
}
