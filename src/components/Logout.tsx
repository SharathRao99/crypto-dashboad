'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import Loading from './Loading'

export default function Logout() {
  const router = useRouter()

  const handleLogout = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    toast.success('Successfully logged out')

    if (res.ok) {
      router.push('/login')
    }
  }

  useEffect(() => {
    handleLogout()
  }, [])

  return (
    <>
      <Loading />
    </>
  )
}
