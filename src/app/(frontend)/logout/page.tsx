import Loading from '@/components/Loading'
import Logout from '@/components/Logout'
import { Suspense } from 'react'

export default function LogoutPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Logout />
    </Suspense>
  )
}
