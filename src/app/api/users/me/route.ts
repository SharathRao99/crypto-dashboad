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

    // If password update is requested
    if (data.currentPassword && data.newPassword) {
      // Verify current password
      const loginResult = await payload.login({
        collection: 'users',
        data: {
          email: user.email,
          password: data.currentPassword,
        },
      })

      if (!loginResult.user) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      // Update user with new password
      const updatedUser = await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password: data.newPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          walletAddress: data.walletAddress,
          address: data.address,
        },
      })

      return NextResponse.json(updatedUser)
    }

    // Regular profile update without password change
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
