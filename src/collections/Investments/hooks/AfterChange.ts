import { CollectionAfterChangeHook } from 'payload'
import { Crypto, Investment, Withdrawal } from '@/payload-types'

export const updateActiveInvestments: CollectionAfterChangeHook<Investment> = async ({
  doc,
  req,
  operation,
}) => {
  // Only update active investments on create or update
  if (operation === 'create' || operation === 'update') {
    const payload = req.payload

    // Ensure we get the string ID for user and crypto
    const userId =
      typeof doc.user === 'object' && doc.user !== null ? doc.user.id : (doc.user as string)
    const cryptoId =
      typeof doc.crypto === 'object' && doc.crypto !== null ? doc.crypto.id : (doc.crypto as string)

    if (!userId || !cryptoId) {
      console.error('User or Crypto ID not found in investment document', doc)
      return doc // Should not happen with required fields, but good to be safe
    }
    // Check if userId and cryptoId are strings, if not, log an error
    if (typeof userId !== 'string' || typeof cryptoId !== 'string') {
      console.error(
        `Extracted IDs are not strings. userId type: ${typeof userId}, cryptoId type: ${typeof cryptoId}`,
        doc,
      )
      // Depending on the expected ID type, you might need to throw or return here
      return doc
    }

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
      (sum: number, inv: Investment) => sum + inv.cryptoAmount,
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
      (sum: number, w: Withdrawal) => sum + (w.amount || 0),
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
      overrideAccess: true,
    })

    try {
      const cryptoDoc = await payload.findByID({
        collection: 'cryptos',
        id: cryptoId,
        overrideAccess: true,
      })

      if (!cryptoDoc || !cryptoDoc.value) {
        console.error('Crypto document or value not found for ID:', cryptoId)
        return doc // Cannot calculate INR value without crypto value
      }

      // Parse the value string to float, handling any formatting
      const valueString = cryptoDoc.value.toString().replace(/,/g, '')
      const currentCryptoValue = parseFloat(valueString)

      if (isNaN(currentCryptoValue)) {
        console.error('Invalid crypto value format for ID:', cryptoId, 'Value:', cryptoDoc.value)
        return doc
      }

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
        console.log('Attempting to create new active-investment entry.')
        console.log('userId:', userId, 'typeof userId:', typeof userId)
        const createData = {
          user: userId,
          crypto: cryptoId,
          activeCryptoAmount,
          activeAmountInr,
          lastUpdated: new Date().toISOString(),
        }
        console.log('Data being sent for create:', createData)
        await payload.create({
          collection: 'active-investments',
          data: createData,
          overrideAccess: true,
        })
      }
    } catch (error) {
      console.error('Error fetching crypto document for ID:', cryptoId, error)
      return doc // Return doc if crypto fetching fails
    }
  }

  // Handle deletion of investments
  if ((operation as any) === 'delete') {
    // Similar logic as update/create but recalculate based on remaining investments/withdrawals
    const payload = req.payload
    const userId = typeof doc.user === 'object' && doc.user !== null ? doc.user.id : doc.user
    const cryptoId =
      typeof doc.crypto === 'object' && doc.crypto !== null ? doc.crypto.id : doc.crypto

    if (!userId || !cryptoId) {
      console.error('User or Crypto ID not found in deleted investment document', doc)
      return doc
    }

    // Recalculate total invested crypto amount for this user and crypto (excluding the deleted one)
    const allInvestmentsForCrypto = await payload.find({
      collection: 'investments',
      where: {
        user: { equals: userId },
        crypto: { equals: cryptoId },
      },
      overrideAccess: true, // Admin bypass to get all investments
    })

    const totalInvestedCryptoAmount = allInvestmentsForCrypto.docs.reduce(
      (sum: number, inv: Investment) => sum + inv.cryptoAmount,
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
      (sum: number, w: Withdrawal) => sum + (w.amount || 0),
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
      overrideAccess: true,
    })

    if (existingActiveInvestment.docs.length > 0) {
      const activeInvestmentId = existingActiveInvestment.docs[0].id
      if (activeCryptoAmount > 0) {
        try {
          const cryptoDoc = await payload.findByID({
            collection: 'cryptos',
            id: cryptoId,
            overrideAccess: true,
          })

          if (!cryptoDoc || !cryptoDoc.value) {
            console.error('Crypto document or value not found for ID:', cryptoId)
            return doc
          }

          // Parse the value string to float, handling any formatting
          const valueString = cryptoDoc.value.toString().replace(/,/g, '')
          const currentCryptoValue = parseFloat(valueString)

          if (isNaN(currentCryptoValue)) {
            console.error(
              'Invalid crypto value format for ID:',
              cryptoId,
              'Value:',
              cryptoDoc.value,
            )
            return doc
          }

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
        } catch (error) {
          console.error(
            'Error fetching crypto document for ID during deletion update:',
            cryptoId,
            error,
          )
          return doc // Return doc if crypto fetching fails
        }
      } else {
        // If active amount is zero or less, delete the record
        await payload.delete({
          collection: 'active-investments',
          id: activeInvestmentId,
          overrideAccess: true,
        })
      }
    }
    // If activeCryptoAmount is <= 0 and no existing record, do nothing.
  }

  return doc
}
