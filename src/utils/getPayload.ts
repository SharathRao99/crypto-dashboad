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

  // Calculate total withdrawals
  const withdrawals = await payload.find({
    collection: 'withdrawals',
    where: {
      and: [
        {
          user: {
            equals: userId,
          },
        },
        {
          'withdrawalDetails.status': {
            equals: 'complete',
          },
        },
      ],
    },
  })

  const totalInvestment = investments.docs.reduce(
    (sum: number, investment: any) => sum + investment.inrValue,
    0,
  )

  console.log('withdrawals, userId', withdrawals)
  const totalWithdrawals = withdrawals.docs.reduce(
    (sum: number, withdrawal: any) => sum + withdrawal.inrValue,
    0,
  )

  return {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImage:
      typeof user.profileImage === 'object' &&
      user.profileImage !== null &&
      typeof user.profileImage.url === 'string'
        ? user.profileImage.url
        : undefined,
    totalInvestment,
    totalWithdrawals,
  }
}

export async function getInvestments(userId: string) {
  const payload = await getPayload({ config: configPromise })

  // Get active investments for the user from the new collection
  const activeInvestments = await payload.find({
    collection: 'active-investments',
    where: {
      user: {
        equals: userId,
      },
    },
    depth: 2, // Increased depth to populate crypto and image relationships
  })

  // Map the results to the desired structure
  return activeInvestments.docs.map((item) => ({
    cryptoName:
      typeof item.crypto === 'object' && item.crypto !== null ? item.crypto.name : undefined,
    cryptoSymbol:
      typeof item.crypto === 'object' && item.crypto !== null ? item.crypto.symbol : undefined,
    cryptoImage:
      typeof item.crypto === 'object' &&
      item.crypto !== null &&
      typeof item.crypto.image === 'object' &&
      item.crypto.image !== null
        ? item.crypto.image.url
        : undefined,
    activeAmountInr:
      item.activeCryptoAmount *
      (typeof item.crypto === 'object' && item.crypto !== null
        ? parseFloat(item.crypto.value.replace(/,/g, ''))
        : 0),
    cryptoAmount: item.activeCryptoAmount, // Use activeCryptoAmount from the new collection
  }))
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

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  walletAddress?: string
  address?: string
  profileImage?: {
    url: string
  }
  role: 'admin' | 'user'
  totalInvestment: number
  investments: {
    cryptoName?: string | null
    cryptoSymbol?: string | null
    cryptoImage?: string | null
    amount: number
    activeAmountInr: number
  }[]
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const payload = await getPayload({ config: configPromise })

  // Get user data
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  // Get user's active investments
  const activeInvestments = await payload.find({
    collection: 'active-investments',
    where: {
      user: {
        equals: userId,
      },
    },
    depth: 2, // Increased depth to populate crypto and image relationships
  })

  // Calculate total investment from active investments
  const totalInvestment = activeInvestments.docs.reduce(
    (sum: number, investment: any) =>
      sum +
      investment.activeCryptoAmount *
        (typeof investment.crypto === 'object' && investment.crypto !== null
          ? parseFloat(investment.crypto.value.replace(/,/g, ''))
          : 0),
    0,
  )

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || undefined,
    walletAddress: user.walletAddress || undefined,
    address: user.address || undefined,
    profileImage:
      typeof user.profileImage === 'object' &&
      user.profileImage !== null &&
      typeof user.profileImage.url === 'string'
        ? { url: user.profileImage.url }
        : undefined,
    role: user.role,
    totalInvestment,
    investments: activeInvestments.docs.map((item) => ({
      cryptoName:
        typeof item.crypto === 'object' && item.crypto !== null ? item.crypto.name : undefined,
      cryptoSymbol:
        typeof item.crypto === 'object' && item.crypto !== null ? item.crypto.symbol : undefined,
      cryptoImage:
        typeof item.crypto === 'object' &&
        item.crypto !== null &&
        typeof item.crypto.image === 'object' &&
        item.crypto.image !== null
          ? item.crypto.image.url
          : undefined,
      amount: item.activeCryptoAmount,
      activeAmountInr:
        item.activeCryptoAmount *
        (typeof item.crypto === 'object' && item.crypto !== null
          ? parseFloat(item.crypto.value.replace(/,/g, ''))
          : 0),
    })),
  }
}
