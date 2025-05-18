'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard, User, CreditCard, DollarSign, LogOut } from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { name: 'Withdrawal Request', href: '/dashboard/withdrawal', icon: DollarSign },
  { name: 'Logout', href: '/logout', icon: LogOut },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 h-h-dvh left-4 z-50">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md bg-white dark:bg-gray-900 shadow-md text-gray-700 dark:text-gray-200"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 top-0 left-0 h-dvh w-64 bg-white dark:bg-gray-900 shadow-lg
          flex flex-col justify-between transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none
        `}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center h-20 px-6 border-b border-gray-100 dark:border-gray-800">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              CryptoDash
            </Link>
          </div>
          {/* Nav Links */}
          <nav className="mt-8 flex flex-col gap-2 px-4">
            {menuItems.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                onClick={() => setOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{name}</span>
              </Link>
            ))}
          </nav>
        </div>
        {/* Mobile Close Button */}
        {open && (
          <button
            className="absolute top-4 right-4 md:hidden p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </aside>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  )
}
