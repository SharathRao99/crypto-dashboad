import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getInvestments, getUserData, verifyAuth } from '@/utils/getPayload'
import { UserProfile } from '@/components/UserProfile'
import { InvestmentCard } from '@/components/InvestmentCard'

export default async function DashboardPage() {
  const headers = await nextHeaders()

  if (!headers) {
    redirect('/login')
  }

  const result = await verifyAuth(headers)

  const user = result.user

  if (!user) {
    redirect('/login')
  }

  const userData = await getUserData(user.id)
  const investments = await getInvestments(user.id)

  console.log('userData', userData)
  console.log('investments', investments)

  return (
    <div className="container">
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        {userData && <UserProfile {...userData} />}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment: any) => (
            <InvestmentCard key={investment.cryptoSymbol} {...investment} />
          ))}
        </div>
      </div>
    </div>
  )
}
