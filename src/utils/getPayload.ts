import configPromise from '@payload-config'
import { getPayload } from 'payload'

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
