import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="w-full lg:flex-1">
        <main className="lg:flex-1 p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
