export const validateWithdrawAmount = async ({ data, req }: { data: any; req: any }) => {
  const userId = data.user
  const cryptoId = data.crypto
  const withdrawAmount = data.amount

  // Step 1: Total invested in this crypto
  try {
    const investments = await req.payload.find({
      collection: 'investments',
      where: {
        and: [{ user: { equals: userId } }, { crypto: { equals: cryptoId } }],
      },
      limit: 1000, // you can optimize further if needed
    })

    const totalInvested = investments.docs.reduce(
      (sum: number, item: { cryptoAmount?: number }) => sum + (item.cryptoAmount || 0),
      0,
    )

    // Step 2: Total withdrawn already (excluding "complete" only or all?)
    const withdrawals = await req.payload.find({
      collection: 'withdrawals',
      where: {
        and: [
          { user: { equals: userId } },
          { crypto: { equals: cryptoId } },
          { 'withdrawalDetails.status': { not_equals: 'rejected' } }, // adjust if needed
        ],
      },
      limit: 1000,
    })

    const totalWithdrawn = withdrawals.docs.reduce(
      (sum: number, item: { amount?: number }) => sum + (item.amount || 0),
      0,
    )

    const availableBalance = totalInvested - totalWithdrawn

    if (withdrawAmount > availableBalance) {
      throw new Error(
        `Insufficient balance. You can withdraw up to ${availableBalance} ${cryptoId}`,
      )
    }
  } catch (error) {
    console.error('Error validating withdraw amount:', error)
    throw new Error('Failed to validate withdraw amount')
  }

  return data
}
