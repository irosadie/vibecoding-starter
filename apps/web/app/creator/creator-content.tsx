"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import { authConfig } from "$/configs/auth"
import { useAuthLogout } from "$/hooks/transactions/use-auth"
import { useCreatorApplicationGetOne } from "$/hooks/transactions/use-creator-application"
import { getCreatorApplicationStatusLabel } from "@vibecoding-starter/schemas"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreatorContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()
  const role = session?.user?.role
  const myApplicationQuery = useCreatorApplicationGetOne({
    enabled: role === "USER",
  })
  const myApplication = myApplicationQuery.data?.application ?? null
  const hasCreatorAccess = role === "CREATOR" || role === "ADMIN"

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace(authConfig.loginPath)
        router.refresh()
      },
    })
  }

  if (!hasCreatorAccess) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
        <PanelCard
          className="rounded-3xl"
          title="Creator Dashboard Terkunci"
          description="Akses creator dashboard membutuhkan approval creator application"
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
          {myApplicationQuery.isLoading ? (
            <p className="text-sm text-slate-600">
              Sedang memuat status pengajuan creator...
            </p>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                Role sesi saat ini: <span className="font-medium">USER</span>
              </p>
              <p>
                Status pengajuan:{" "}
                <span className="font-medium">
                  {myApplication
                    ? getCreatorApplicationStatusLabel(myApplication.status)
                    : "Belum ada pengajuan"}
                </span>
              </p>
              {myApplication?.status === "APPROVED" ? (
                <p className="text-xs text-slate-600">
                  Pengajuan sudah approved, tapi sesi belum membawa role
                  creator. Silakan logout lalu login ulang.
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/panel"
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Panel
            </Link>
            <Link
              href="/panel/creator-application/status"
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Lihat Status Pengajuan
            </Link>
          </div>
        </PanelCard>
      </main>
    )
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

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/creator/exams"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Open Exam Authoring Dashboard
          </Link>
        </div>
      </PanelCard>
    </main>
  )
}
