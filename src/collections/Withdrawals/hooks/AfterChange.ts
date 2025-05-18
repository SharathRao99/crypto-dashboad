import { CollectionAfterChangeHook } from 'payload'
import { Withdrawal } from '@/payload-types'

export const updateActiveInvestments: CollectionAfterChangeHook<Withdrawal> = async ({
  doc,
  req,
  operation,
}) => {
  // Only update active investments when a withdrawal is completed or updated to completed
  if (operation === 'create' || operation === 'update') {
    // Check if the withdrawal status is complete
    const oldDoc =
      operation === 'update'
        ? await req.payload.findByID({
            collection: 'withdrawals',
            id: doc.id,
            overrideAccess: true,
          })
        : null

    const isStatusComplete = doc.withdrawalDetails?.status === 'complete'
    const wasStatusComplete = oldDoc?.withdrawalDetails?.status === 'complete'

    // Only proceed if status becomes complete or is already complete and updated
    if (isStatusComplete) {
      const payload = req.payload
      const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
      const cryptoId = typeof doc.crypto === 'object' ? doc.crypto.id : doc.crypto

      if (!userId || !cryptoId) return doc // Should not happen with required fields

      // Recalculate total invested crypto amount for this user and crypto
      const allInvestmentsForCrypto = await payload.find({
        collection: 'investments',
        where: {
          user: { equals: userId },
          crypto: { equals: cryptoId },
        },
        overrideAccess: true, // Admin bypass to get all investments
      })

      const totalInvestedCryptoAmount = allInvestmentsForCrypto.docs.reduce(
        (sum, inv) => sum + inv.cryptoAmount,
        0,
      )

      // Recalculate total withdrawn crypto amount for this user and crypto (only completed withdrawals)
      const allWithdrawalsForCrypto = await payload.find({
        collection: 'withdrawals',
        where: {
          user: { equals: userId },
          crypto: { equals: cryptoId },
          'withdrawalDetails.status': { equals: 'complete' },
        },
        overrideAccess: true, // Admin bypass
      })

      const totalWithdrawnCryptoAmount = allWithdrawalsForCrypto.docs.reduce(
        (sum, w) => sum + (w.amount || 0),
        0,
      )

      const activeCryptoAmount = totalInvestedCryptoAmount - totalWithdrawnCryptoAmount

      // Find or create the active investment record
      const existingActiveInvestment = await payload.find({
        collection: 'active-investments',
        where: {
          user: { equals: userId },
          crypto: { equals: cryptoId },
        },
        limit: 1, // Should only be one active investment per user/crypto
        overrideAccess: true,
      })

      try {
        const cryptoDoc = await payload.findByID({
          collection: 'cryptos',
          id: cryptoId,
          overrideAccess: true,
        })

        if (!cryptoDoc || typeof cryptoDoc.value !== 'string') {
          console.error('Crypto document or value not found for ID:', cryptoId)
          return doc // Cannot calculate INR value without crypto value
        }

        const currentCryptoValue = parseFloat(cryptoDoc.value)
        const activeAmountInr = activeCryptoAmount * currentCryptoValue

        if (existingActiveInvestment.docs.length > 0) {
          // Update existing record
          const activeInvestmentId = existingActiveInvestment.docs[0].id
          if (activeCryptoAmount > 0) {
            await payload.update({
              collection: 'active-investments',
              id: activeInvestmentId,
              data: {
                activeCryptoAmount,
                activeAmountInr,
                lastUpdated: new Date().toISOString(),
              },
              overrideAccess: true,
            })
          } else {
            // If active amount is zero or less, delete the record
            await payload.delete({
              collection: 'active-investments',
              id: activeInvestmentId,
              overrideAccess: true,
            })
          }
        } else if (activeCryptoAmount > 0) {
          // Create new record
          await payload.create({
            collection: 'active-investments',
            data: {
              user: userId,
              crypto: cryptoId,
              activeCryptoAmount,
              activeAmountInr,
              lastUpdated: new Date().toISOString(),
            },
            overrideAccess: true,
          })
        }
      } catch (error) {
        console.error('Error updating active investments:', error)
        return doc
      }
    }
  }

  // Handle deletion of withdrawals
  if ((operation as any) === 'delete') {
    const payload = req.payload
    const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
    const cryptoId = typeof doc.crypto === 'object' ? doc.crypto.id : doc.crypto

    if (!userId || !cryptoId) return doc

    try {
      // Recalculate total invested crypto amount for this user and crypto
      const allInvestmentsForCrypto = await payload.find({
        collection: 'investments',
        where: {
          user: { equals: userId },
          crypto: { equals: cryptoId },
        },
        overrideAccess: true, // Admin bypass to get all investments
      })

      const totalInvestedCryptoAmount = allInvestmentsForCrypto.docs.reduce(
        (sum, inv) => sum + inv.cryptoAmount,
        0,
      )

      // Recalculate total withdrawn crypto amount for this user and crypto (only completed withdrawals)
      const allWithdrawalsForCrypto = await payload.find({
        collection: 'withdrawals',
        where: {
          user: { equals: userId },
          crypto: { equals: cryptoId },
          'withdrawalDetails.status': { equals: 'complete' },
        },
        overrideAccess: true, // Admin bypass
      })

      const totalWithdrawnCryptoAmount = allWithdrawalsForCrypto.docs.reduce(
        (sum, w) => sum + (w.amount || 0),
        0,
      )

      const activeCryptoAmount = totalInvestedCryptoAmount - totalWithdrawnCryptoAmount

      // Find or create the active investment record
      const existingActiveInvestment = await payload.find({
        collection: 'active-investments',
        where: {
          user: { equals: userId },
          crypto: { equals: cryptoId },
        },
        limit: 1, // Should only be one active investment per user/crypto
        overrideAccess: true,
      })

      if (existingActiveInvestment.docs.length > 0) {
        const activeInvestmentId = existingActiveInvestment.docs[0].id
        if (activeCryptoAmount > 0) {
          const cryptoDoc = await payload.findByID({
            collection: 'cryptos',
            id: cryptoId,
            overrideAccess: true,
          })

          if (!cryptoDoc || typeof cryptoDoc.value !== 'string') {
            console.error('Crypto document or value not found for ID:', cryptoId)
            return doc
          }

          const currentCryptoValue = parseFloat(cryptoDoc.value)
          const activeAmountInr = activeCryptoAmount * currentCryptoValue

          await payload.update({
            collection: 'active-investments',
            id: activeInvestmentId,
            data: {
              activeCryptoAmount,
              activeAmountInr,
              lastUpdated: new Date().toISOString(),
            },
            overrideAccess: true,
          })
        } else {
          // If active amount is zero or less, delete the record
          await payload.delete({
            collection: 'active-investments',
            id: activeInvestmentId,
            overrideAccess: true,
          })
        }
      }
    } catch (error) {
      console.error('Error updating active investments after withdrawal deletion:', error)
      return doc
    }
  }
  return doc
}
