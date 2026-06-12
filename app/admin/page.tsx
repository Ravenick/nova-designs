'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { headers } from 'next/headers'

export default async function AdminDashboard() {
  // Check authentication server-side
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            <span className="text-foreground">Nova</span>
            <span className="text-primary">Designs</span>
            <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              Admin
            </span>
          </Link>
          <form
            action={async () => {
              'use server'
              await auth.api.signOut({ headers: await headers() })
              redirect('/')
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Welcome to the admin panel for {session.user.email}. Feature development in progress.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border p-6 bg-secondary/50">
              <h2 className="text-xl font-semibold mb-2">📊 Overview</h2>
              <p className="text-sm text-muted-foreground mb-4">
                View sales analytics, customer stats, and revenue reports.
              </p>
              <button disabled className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed">
                Coming soon
              </button>
            </div>

            <div className="rounded-lg border border-border p-6 bg-secondary/50">
              <h2 className="text-xl font-semibold mb-2">🏗️ Plans</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create, edit, and manage house plans and their details.
              </p>
              <button disabled className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed">
                Coming soon
              </button>
            </div>

            <div className="rounded-lg border border-border p-6 bg-secondary/50">
              <h2 className="text-xl font-semibold mb-2">📦 Orders</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Track orders, manage fulfillment, and view customer information.
              </p>
              <button disabled className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed">
                Coming soon
              </button>
            </div>

            <div className="rounded-lg border border-border p-6 bg-secondary/50">
              <h2 className="text-xl font-semibold mb-2">📥 Downloads</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage downloadable files and track download analytics.
              </p>
              <button disabled className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed">
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

