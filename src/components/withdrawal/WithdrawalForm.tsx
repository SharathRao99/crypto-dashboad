'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Crypto as PayloadCrypto } from '@/payload-types'
import Image from 'next/image'

const withdrawalSchema = z.object({
  crypto: z.string().min(1, 'Please select a cryptocurrency'),
  amount: z.number().min(0.000001, 'Amount must be greater than 0'),
})

type WithdrawalFormData = z.infer<typeof withdrawalSchema>

interface WithdrawalFormProps {
  cryptos: PayloadCrypto[]
}

interface CryptoPrice {
  [key: string]: number
}

export function WithdrawalForm({ cryptos }: WithdrawalFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<PayloadCrypto | null>(null)
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice>({})

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/crypto/prices')
        if (!response.ok) throw new Error('Failed to fetch prices')
        const data = await response.json()
        setCryptoPrices(data)
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
        toast.error('Failed to fetch cryptocurrency prices')
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 60000) // Update prices every minute
    return () => clearInterval(interval)
  }, [])

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      crypto: '',
      amount: 0,
    },
  })

  const onSubmit = async (data: WithdrawalFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          inrValue: selectedCrypto ? data.amount * (cryptoPrices[selectedCrypto.symbol] || 0) : 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create withdrawal request')
      }

      toast.success('Withdrawal request submitted successfully')
      router.refresh()
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create withdrawal request')
      console.error('Error creating withdrawal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCryptoChange = (value: string) => {
    const crypto = cryptos.find((c) => c.id === value)
    setSelectedCrypto(crypto || null)
    form.setValue('crypto', value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Cryptocurrency</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="crypto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Cryptocurrency</FormLabel>
                    <Select onValueChange={handleCryptoChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cryptocurrency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cryptos.map((crypto) => (
                          <SelectItem key={crypto.id} value={crypto.id}>
                            <div className="flex items-center gap-2">
                              {typeof crypto.image === 'object' && crypto.image && (
                                <Image
                                  src={crypto.image.url || ''}
                                  alt={crypto.name}
                                  width={60}
                                  height={40}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span>
                                {crypto.name} ({crypto.symbol.toUpperCase()})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    {selectedCrypto && cryptoPrices[selectedCrypto.symbol] && (
                      <p className="text-sm text-muted-foreground">
                        ≈ ₹{(field.value * cryptoPrices[selectedCrypto.symbol]).toLocaleString()}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Withdrawal Request'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
