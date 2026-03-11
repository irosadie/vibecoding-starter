"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import { authConfig } from "$/configs/auth"
import { useAuthLogout } from "$/hooks/transactions/use-auth"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function CreatorContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace(authConfig.loginPath)
        router.refresh()
      },
    })
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <PanelCard
        className="rounded-3xl"
        title="Creator Area"
        description="Area ini hanya bisa diakses creator dan admin"
        action={
          <Button
            intent="secondary"
            onClick={handleSignOut}
            loading={logoutMutation.isPending}
          >
            Sign Out
          </Button>
        }
      >
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            Signed in as{" "}
            <span className="font-medium text-slate-900">
              {session?.user?.name || "Unknown User"}
            </span>
          </p>
          <p>{session?.user?.email || "No email in session"}</p>
          <p>Role: {session?.user?.role || "UNKNOWN"}</p>
          <p>Status: {session?.user?.status || "UNKNOWN"}</p>
        </div>
      </PanelCard>
    </main>
  )
}
