import { CollectionConfig } from 'payload'
import { validateWithdrawAmount } from './hooks/ValidateWithdraw'

const Withdrawals: CollectionConfig = {
  slug: 'withdrawals',
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => user?.role === 'user' || user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [validateWithdrawAmount],
    afterChange: [
      async ({ doc, req, operation }) => {
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

            const cryptoDoc = await payload.findByID({
              collection: 'cryptos',
              id: cryptoId,
              overrideAccess: true,
            })

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
          }
        }

        // Handle deletion of withdrawals
        if ((operation as any) === 'delete') {
          // Similar logic as update/create but recalculate based on remaining investments/withdrawals
          const payload = req.payload
          const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
          const cryptoId = typeof doc.crypto === 'object' ? doc.crypto.id : doc.crypto

          if (!userId || !cryptoId) return doc

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
          // If activeCryptoAmount is <= 0 and no existing record, do nothing.
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'crypto',
      type: 'relationship',
      relationTo: 'cryptos',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Available balance: ',
      },
    },
    {
      name: 'inrValue',
      type: 'number',
      required: true,
    },
    {
      name: 'withdrawalDetails',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'pending',
          required: true,
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Complete', value: 'complete' },
          ],
        },
        {
          name: 'transactionId',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.status === 'complete',
          },
        },
        {
          name: 'timestamp',
          type: 'date',
          defaultValue: new Date(),
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
  ],
}

export default Withdrawals
