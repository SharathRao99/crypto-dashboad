import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function verifyAuth(headers: any) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.auth({ headers })

  return result
}

export async function getUserData(userId: string) {
  const payload = await getPayload({ config: configPromise })
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  // Calculate total investment
  const investments = await payload.find({
    collection: 'investments',
    where: {
      user: {
        equals: userId,
      },
    },
  })

  const totalInvestment = investments.docs.reduce(
    (sum: number, investment: any) => sum + investment.inrValue,
    0,
  )

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    profileImage: user.profileImage,
    totalInvestment,
    email: user.email,
  }
}

export async function getInvestments(userId: string) {
  const payload = await getPayload({ config: configPromise })

  // Get all investments for the user
  const investments = await payload.find({
    collection: 'investments',
    where: {
      user: {
        equals: userId,
      },
    },
    depth: 2, // This will populate the crypto relationship
  })

  // Get all withdrawals for the user
  const withdrawals = await payload.find({
    collection: 'withdrawals',
    where: {
      and: [
        { user: { equals: userId } },
        { 'withdrawalDetails.status': { not_equals: 'rejected' } },
      ],
    },
  })

  // Calculate active investments by crypto
  const activeInvestments = investments.docs.reduce((acc: any, investment: any) => {
    const cryptoId = investment.crypto.id
    const cryptoAmount = investment.cryptoAmount

    // Calculate total withdrawn for this crypto
    const totalWithdrawn = withdrawals.docs
      .filter((w: any) => w.crypto === cryptoId)
      .reduce((sum: number, w: any) => sum + (w.amount || 0), 0)

    // Calculate active amount
    const activeAmount = cryptoAmount - totalWithdrawn

    if (activeAmount > 0) {
      if (!acc[cryptoId]) {
        acc[cryptoId] = {
          cryptoName: investment.crypto.name,
          cryptoSymbol: investment.crypto.symbol,
          cryptoImage: investment.crypto.image.url,
          investedAmount: investment.inrValue,
          cryptoAmount: activeAmount,
        }
      } else {
        acc[cryptoId].investedAmount += investment.inrValue
        acc[cryptoId].cryptoAmount += activeAmount
      }
    }

    return acc
  }, {})

  return Object.values(activeInvestments)
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

export async function getTransactions(
  userId: string,
): Promise<{ investments: Transaction[]; withdrawals: Transaction[] }> {
  const payload = await getPayload({ config: configPromise })

  // Get all investments for the user
  const investments = await payload.find({
    collection: 'investments',
    where: {
      user: {
        equals: userId,
      },
    },
    depth: 2, // This will populate the crypto relationship
    sort: '-purchaseDateTime', // Sort by purchase date in descending order
  })

  // Get all withdrawals for the user
  const withdrawals = await payload.find({
    collection: 'withdrawals',
    where: {
      user: {
        equals: userId,
      },
    },
    depth: 2, // This will populate the crypto relationship
    sort: '-withdrawalDetails.timestamp', // Sort by timestamp in descending order
  })

  return {
    investments: investments.docs.map(
      (investment: any): Transaction => ({
        id: investment.id,
        type: 'investment',
        cryptoName: investment.crypto.name,
        cryptoSymbol: investment.crypto.symbol,
        cryptoImage: investment.crypto.image.url,
        amount: investment.cryptoAmount,
        inrValue: investment.inrValue,
        date: investment.purchaseDateTime,
        transactionId: investment.transactionId,
        notes: investment.notes,
      }),
    ),
    withdrawals: withdrawals.docs.map(
      (withdrawal: any): Transaction => ({
        id: withdrawal.id,
        type: 'withdrawal',
        cryptoName: withdrawal.crypto.name,
        cryptoSymbol: withdrawal.crypto.symbol,
        cryptoImage: withdrawal.crypto.image.url,
        amount: withdrawal.amount,
        inrValue: withdrawal.inrValue,
        date: withdrawal.withdrawalDetails.timestamp,
        status: withdrawal.withdrawalDetails.status,
        transactionId: withdrawal.withdrawalDetails.transactionId,
      }),
    ),
  }
}
