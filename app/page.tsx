import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  // Dashboard will be expanded with plans, cart, and order management
  return (
    <main className="min-h-svh bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Welcome to Nova Designs</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Signed in as {session.user.email}
        </p>
        <div className="grid gap-6">
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-semibold mb-2">Plans</h2>
            <p className="text-muted-foreground">Browse and purchase design plans</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-semibold mb-2">Cart</h2>
            <p className="text-muted-foreground">Manage your shopping cart</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-muted-foreground">View your order history</p>
          </div>
        </div>
      </div>
    </main>
  )
}
