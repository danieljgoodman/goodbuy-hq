import Link from 'next/link'
import SignUpForm from '@/components/forms/signup-form'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-6">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">
              GoodBuy HQ
            </h1>
          </Link>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Join thousands of successful business professionals
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you&apos;re buying, selling, or brokering businesses, our
              platform provides the tools and insights you need to succeed.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  For Business Buyers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Access verified listings, detailed financials, and
                  professional evaluations.
                </p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  For Business Owners
                </h3>
                <p className="text-sm text-muted-foreground">
                  List your business, get professional valuations, and connect
                  with qualified buyers.
                </p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  For Brokers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage multiple listings, provide evaluations, and grow your
                  client base.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="flex justify-center lg:justify-end">
          <div className="card w-full max-w-md">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  )
}
