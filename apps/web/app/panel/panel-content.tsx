"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import { authConfig } from "$/configs/auth"
import { useAuthLogout } from "$/hooks/transactions/use-auth"
import { useCreatorApplicationGetOne } from "$/hooks/transactions/use-creator-application"
import {
  type CreatorApplicationStatus,
  getCreatorApplicationStatusLabel,
} from "@vibecoding-starter/schemas"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PanelContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()
  const role = session?.user?.role
  const myApplicationQuery = useCreatorApplicationGetOne({
    enabled: role === "USER",
  })
  const applicationStatus =
    (myApplicationQuery.data?.application
      ?.status as CreatorApplicationStatus) ?? null
  const canOpenCreatorDashboard = role === "CREATOR" || role === "ADMIN"
  const isApprovedButRoleNotUpdated =
    role === "USER" && applicationStatus === "APPROVED"

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
        title="User Panel"
        description="Area ini bisa diakses user dan admin"
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
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {canOpenCreatorDashboard ? (
            <Link
              href="/creator"
              className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
            >
              Buka Creator Dashboard
            </Link>
          ) : null}
          <Link
            href="/panel/creator-application/apply"
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Apply Creator
          </Link>
          <Link
            href="/panel/creator-application/status"
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Lihat Status Pengajuan
          </Link>
        </div>
        {role === "USER" ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700">
            <p>
              Status pengajuan creator:{" "}
              <span className="font-medium">
                {applicationStatus
                  ? getCreatorApplicationStatusLabel(applicationStatus)
                  : myApplicationQuery.isLoading
                    ? "Memuat..."
                    : "Belum ada pengajuan"}
              </span>
            </p>
            {isApprovedButRoleNotUpdated ? (
              <p className="mt-1 text-xs text-slate-600">
                Pengajuan sudah disetujui. Jika akses creator belum aktif,
                lakukan logout lalu login ulang untuk refresh session role.
              </p>
            ) : null}
          </div>
        ) : null}
      </PanelCard>
    </main>
  )
}
