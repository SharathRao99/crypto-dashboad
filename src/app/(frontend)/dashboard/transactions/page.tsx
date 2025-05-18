import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAuth, getTransactions } from '@/utils/getPayload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { format } from 'date-fns'

interface TransactionCardProps {
  cryptoName: string
  cryptoSymbol: string
  cryptoImage: string
  amount: number
  inrValue: number
  date: string
  transactionId: string
  type: 'investment' | 'withdrawal'
  status?: string
  notes?: string
}

function TransactionCard({
  cryptoName,
  cryptoSymbol,
  cryptoImage,
  amount,
  inrValue,
  date,
  transactionId,
  type,
  status,
  notes,
}: TransactionCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="relative h-12 w-12">
          <Image src={cryptoImage} alt={cryptoName} fill className="rounded-full object-cover" />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold">{cryptoName}</CardTitle>
          <p className="text-sm text-muted-foreground">{cryptoSymbol}</p>
        </div>
        <div className="ml-auto">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              type === 'investment' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {type === 'investment' ? 'Investment' : 'Withdrawal'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-medium">
              {amount.toFixed(8)} {cryptoSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">INR Value</span>
            <span className="font-medium">₹{inrValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="font-medium">{format(new Date(date), 'PPp')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Transaction ID</span>
            <span className="font-medium">{transactionId}</span>
          </div>
          {status && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span
                className={`font-medium ${
                  status === 'complete'
                    ? 'text-green-600'
                    : status === 'rejected'
                      ? 'text-red-600'
                      : status === 'inProgress'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          )}
          {notes && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Notes</span>
              <span className="font-medium">{notes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface Transaction {
  id: string
  type: 'investment' | 'withdrawal'
  cryptoName: string
  cryptoSymbol: string
  cryptoImage: string
  amount: number
  inrValue: number
  date: string
  transactionId: string
  status?: string
  notes?: string
}

export default async function TransactionPage() {
  const headers = await nextHeaders()

  if (!headers) {
    redirect('/login')
  }

  const result = await verifyAuth(headers)
  const user = result.user

  if (!user) {
    redirect('/login')
  }

  const { investments, withdrawals } = await getTransactions(user.id)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <Tabs defaultValue="investments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        <TabsContent value="investments" className="space-y-4">
          {investments.length === 0 ? (
            <p className="text-center text-muted-foreground">No investments found</p>
          ) : (
            investments.map((investment: Transaction) => (
              <TransactionCard key={investment.id} {...investment} />
            ))
          )}
        </TabsContent>
        <TabsContent value="withdrawals" className="space-y-4">
          {withdrawals.length === 0 ? (
            <p className="text-center text-muted-foreground">No withdrawals found</p>
          ) : (
            withdrawals.map((withdrawal: Transaction) => (
              <TransactionCard key={withdrawal.id} {...withdrawal} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
