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

    // Update password
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: data.newPassword,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
