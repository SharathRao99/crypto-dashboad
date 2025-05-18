import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { email } from 'node_modules/payload/dist/fields/validations'

interface UserProfileProps {
  firstName: string
  lastName: string
  email: string
  profileImage?: string
  totalInvestment: number
  totalWithdrawals: number
}

export function UserProfile({
  firstName,
  lastName,
  profileImage,
  email,
  totalInvestment,
  totalWithdrawals,
}: UserProfileProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-full flex flex-col md:flex-row justify-between">
            <div className="w-full md:w-1/2 flex gap-4">
              <div className="relative h-16 w-16">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={`${firstName} ${lastName}`}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-2xl font-semibold">
                    {firstName[0]}
                    {lastName[0]}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h2 className="text-xl font-semibold">
                  {firstName} {lastName}
                </h2>
                <h5>{email}</h5>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-between">
              <div className="w-1/2 flex flex-col">
                <h5 className="text-lg text-muted-foreground">Total Investment</h5>
                <p className="text-2xl font-bold">₹{totalInvestment.toLocaleString()}</p>
              </div>
              <div className="w-1/2 flex flex-col">
                <h5 className="text-lg text-muted-foreground">Total Withdrawals</h5>
                <p className="text-2xl font-bold">₹{totalWithdrawals.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
