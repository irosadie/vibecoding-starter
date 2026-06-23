"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import { authConfig } from "$/configs/auth"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PanelContent() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
    })
    router.replace(authConfig.loginPath)
    router.refresh()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <PanelCard
        className="rounded-3xl"
        title="Starter Panel"
        description="Protected route after successful authentication"
        action={
          <Button intent="secondary" onClick={handleSignOut}>
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
          <p>Company ID: {session?.user?.companyId ?? 0}</p>
        </div>
      </PanelCard>
    </main>
  )
}
