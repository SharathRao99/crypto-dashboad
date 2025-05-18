import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const cryptos = await payload.find({
      collection: 'cryptos',
      limit: 100,
    })

    const symbols = cryptos.docs.map((crypto) => crypto.symbol.toLowerCase()).join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=inr`,
    )

    if (!response.ok) {
      throw new Error('Failed to fetch prices from CoinGecko')
    }

    const data = await response.json()
    const prices: { [key: string]: number } = {}

    // Convert CoinGecko response to our format
    Object.entries(data).forEach(([id, value]) => {
      const crypto = cryptos.docs.find((c) => c.symbol.toLowerCase() === id)
      if (crypto) {
        prices[crypto.symbol] = (value as { inr: number }).inr
      }
    })

    return NextResponse.json(prices)
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return NextResponse.json({ error: 'Failed to fetch cryptocurrency prices' }, { status: 500 })
  }
}
