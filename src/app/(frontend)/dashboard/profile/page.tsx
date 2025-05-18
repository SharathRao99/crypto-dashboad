import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAuth, getUserProfile } from '@/utils/getPayload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { InvestmentCard } from '@/components/InvestmentCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ProfilePage() {
  const headers = await nextHeaders()

  if (!headers) {
    redirect('/login')
  }

  const result = await verifyAuth(headers)
  const user = result.user

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile(user.id)

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 sm:px-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <Button asChild>
            <Link href="/dashboard/profile/edit">Edit Profile</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            {profile.profileImage ? (
              <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                <Image
                  src={profile.profileImage.url}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-muted text-2xl sm:text-3xl font-semibold">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
            )}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground capitalize mt-1">{profile.role}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">First Name</h4>
                  <p className="text-base">{profile.firstName || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Name</h4>
                  <p className="text-base">{profile.lastName || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p className="text-base break-all">{profile.email || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                  <p className="text-base">{profile.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Wallet Address</h4>
                  <p className="text-base break-all">
                    {profile.walletAddress || 'No wallet address provided'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                  <p className="text-base whitespace-pre-wrap">
                    {profile.address || 'No address provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Investment</h3>
            <p className="text-2xl font-bold">₹{profile.totalInvestment.toLocaleString()}</p>
          </div>

          <Tabs defaultValue="investments" className="space-y-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="investments" className="w-full sm:w-auto">
                Active Investments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="investments" className="space-y-4">
              {profile.investments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active investments found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start investing to see your portfolio here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.investments.map((investment) => (
                    <InvestmentCard
                      key={`${investment.cryptoName}-${investment.cryptoSymbol}`}
                      cryptoName={investment.cryptoName}
                      cryptoSymbol={investment.cryptoSymbol}
                      cryptoImage={investment.cryptoImage}
                      investedAmount={investment.inrValue}
                      cryptoAmount={investment.amount}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
