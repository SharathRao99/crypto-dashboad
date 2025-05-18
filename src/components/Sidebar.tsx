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
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <Link href="/dashboard" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          CryptoDash
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md bg-white dark:bg-gray-900 shadow text-gray-700 dark:text-gray-200"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Slide-in Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-200 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        {/* Slide-in Menu */}
        <nav
          className={`absolute top-0 right-0 h-full w-full bg-white dark:bg-gray-900 shadow-lg flex flex-col gap-2 px-4 pt-20 transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
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

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:sticky lg:z-40 lg:top-0 lg:left-0 lg:h-dvh lg:w-80 lg:bg-white lg:dark:bg-gray-900 lg:shadow-lg
          lg:flex lg:flex-col lg:justify-between
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
      </aside>
    </>
  )
}
