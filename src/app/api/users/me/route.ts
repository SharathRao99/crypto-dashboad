import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyAuth } from '@/utils/getPayload'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function PATCH(request: Request) {
  try {
    const headersList = headers()
    const result = await verifyAuth(headersList)
    const user = result.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const data = await request.json()

    // Update user profile
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        walletAddress: data.walletAddress,
        address: data.address,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
