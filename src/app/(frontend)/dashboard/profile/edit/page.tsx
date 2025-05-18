import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAuth, getUserProfile } from '@/utils/getPayload'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { PasswordForm } from '@/components/profile/PasswordForm'

export default async function EditProfilePage() {
  const headersList = headers()

  if (!headersList) {
    redirect('/login')
  }

  const result = await verifyAuth(headersList)
  const user = result.user

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile(user.id)

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 sm:px-6">
      <ProfileForm
        initialData={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          walletAddress: profile.walletAddress,
          address: profile.address,
        }}
      />
      <PasswordForm />
    </div>
  )
}
