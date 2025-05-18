import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface UserProfileProps {
  firstName: string
  lastName: string
  profileImage?: string
  totalInvestment: number
}

export function UserProfile({
  firstName,
  lastName,
  profileImage,
  totalInvestment,
}: UserProfileProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
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
          <div>
            <h2 className="text-xl font-semibold">
              {firstName} {lastName}
            </h2>
            <p className="text-sm text-muted-foreground">Total Investment</p>
            <p className="text-2xl font-bold">₹{totalInvestment.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
