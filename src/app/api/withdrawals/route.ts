import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyAuth } from '@/utils/getPayload'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  try {
    const headersList = headers()
    const result = await verifyAuth(headersList)
    const user = result.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const data = await request.json()

    // Get user's investments for the selected crypto
    const investments = await payload.find({
      collection: 'investments',
      where: {
        and: [{ user: { equals: user.id } }, { crypto: { equals: data.crypto } }],
      },
      limit: 1000,
    })

    const totalInvested = investments.docs.reduce(
      (sum: number, item: { cryptoAmount?: number }) => sum + (item.cryptoAmount || 0),
      0,
    )

    // Get user's withdrawals for the selected crypto
    const withdrawals = await payload.find({
      collection: 'withdrawals',
      where: {
        and: [
          { user: { equals: user.id } },
          { crypto: { equals: data.crypto } },
          { 'withdrawalDetails.status': { not_equals: 'rejected' } },
        ],
      },
      limit: 1000,
    })

    const totalWithdrawn = withdrawals.docs.reduce(
      (sum: number, item: { amount?: number }) => sum + (item.amount || 0),
      0,
    )

    const availableBalance = totalInvested - totalWithdrawn

    if (data.amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. You can withdraw up to ${availableBalance}` },
        { status: 400 },
      )
    }

    // Create withdrawal request
    const withdrawal = await payload.create({
      collection: 'withdrawals',
      data: {
        user: user.id,
        crypto: data.crypto,
        amount: data.amount,
        inrValue: data.inrValue,
        withdrawalDetails: {
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json(withdrawal)
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 })
  }
}
