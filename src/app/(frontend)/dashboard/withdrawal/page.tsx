import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAuth } from '@/utils/getPayload'
import { WithdrawalForm } from '@/components/withdrawal/WithdrawalForm'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function WithdrawPage() {
  const headersList = headers()
  const result = await verifyAuth(headersList)
  const user = result.user

  if (!user) {
    redirect('/login')
  }

  const payload = await getPayload({ config: configPromise })
  const cryptos = await payload.find({
    collection: 'cryptos',
    limit: 100,
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Withdraw Funds</h1>
      <WithdrawalForm cryptos={cryptos.docs} />
    </div>
  )
}
