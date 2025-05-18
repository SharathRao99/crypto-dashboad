import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface InvestmentCardProps {
  cryptoName: string
  cryptoSymbol: string
  cryptoImage: string
  investedAmount: number
  cryptoAmount: number
}

export function InvestmentCard({
  cryptoName,
  cryptoSymbol,
  cryptoImage,
  investedAmount,
  cryptoAmount,
}: InvestmentCardProps) {
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
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Invested Amount</span>
            <span className="font-medium">₹{investedAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Crypto Amount</span>
            <span className="font-medium">{cryptoAmount.toFixed(8)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
