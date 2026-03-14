"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import { authConfig } from "$/configs/auth"
import { useAuthLogout } from "$/hooks/transactions/use-auth"
import { useCreatorApplicationGetOne } from "$/hooks/transactions/use-creator-application"
import { cn } from "$/utils/cn"
import {
  type CreatorApplicationStatus,
  getCreatorApplicationStatusLabel,
} from "@vibecoding-starter/schemas"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

type WorkspaceAction = {
  id: string
  title: string
  description: string
  href: string
  highlighted?: boolean
}

const statusToBadgeVariant = (status: CreatorApplicationStatus | null) => {
  if (status === "APPROVED") {
    return "success"
  }

  if (status === "REJECTED") {
    return "danger"
  }

  if (status === "PENDING") {
    return "warning"
  }

  return "neutral"
}

export default function CreatorPageContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()
  const role = session?.user?.role ?? "USER"
  const myApplicationQuery = useCreatorApplicationGetOne({
    enabled: role === "USER",
  })
  const myApplication = myApplicationQuery.data?.application ?? null
  const applicationStatus =
    (myApplication?.status as CreatorApplicationStatus | null) ?? null
  const hasCreatorAccess = role === "CREATOR" || role === "ADMIN"
  const isAdmin = role === "ADMIN"

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace(authConfig.loginPath)
        router.refresh()
      },
    })
  }

  const lockedStateMessage = useMemo(() => {
    if (applicationStatus === "PENDING") {
      return "Pengajuan creator sedang direview admin. Pantau progresnya dari halaman status."
    }

    if (applicationStatus === "REJECTED") {
      return "Pengajuan creator ditolak. Perbarui data payout dan upload ulang dokumen untuk mengajukan lagi."
    }

    if (applicationStatus === "APPROVED") {
      return "Pengajuan sudah approved, tetapi sesi kamu belum membawa role creator. Logout-login ulang untuk refresh role."
    }

    return "Kamu belum mengajukan creator application. Lengkapi pengajuan untuk membuka creator workspace."
  }, [applicationStatus])

  const workspaceActions = useMemo<WorkspaceAction[]>(() => {
    const actions: WorkspaceAction[] = [
      {
        id: "creator-exams",
        title: "Kelola Draft Ujian",
        description:
          "Buat draft, edit soal, dan submit review ke admin dari satu workspace.",
        href: "/creator/exams",
        highlighted: true,
      },
      {
        id: "catalog",
        title: "Lihat Katalog Publik",
        description: "Cek tampilan listing exam seperti yang dilihat user.",
        href: "/exams",
      },
      {
        id: "checkout",
        title: "Pantau Checkout",
        description: "Pantau flow pembelian dan status order dari sisi user.",
        href: "/checkout",
      },
      {
        id: "panel",
        title: "Kembali ke User Panel",
        description:
          "Buka ringkasan akun dan journey creator dari dashboard utama.",
        href: "/panel",
      },
    ]

    if (isAdmin) {
      actions.push({
        id: "admin-review",
        title: "Admin Exam Review Queue",
        description:
          "Masuk ke queue review admin untuk approve/reject submission.",
        href: "/admin/exam-reviews",
      })
    }

    return actions
  }, [isAdmin])

  const recommendation = useMemo(() => {
    if (hasCreatorAccess) {
      return {
        title: "Lanjutkan authoring ujian",
        description:
          "Mulai dari workspace draft ujian, lalu kirim submission untuk direview admin.",
        href: "/creator/exams",
        cta: "Buka draft ujian",
      }
    }

    if (applicationStatus === "PENDING") {
      return {
        title: "Pantau status review",
        description:
          "Pengajuan sedang diproses admin, tidak perlu submit ulang saat pending.",
        href: "/panel/creator-application/status",
        cta: "Lihat status",
      }
    }

    return {
      title: "Lengkapi pengajuan creator",
      description:
        "Isi data payout dan upload dokumen KTP agar akses creator bisa dibuka.",
      href: "/panel/creator-application/apply",
      cta: "Isi pengajuan",
    }
  }, [applicationStatus, hasCreatorAccess])

  if (!hasCreatorAccess) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary-50 p-6 shadow-xs">
          <div className="absolute -right-14 -top-12 h-40 w-40 rounded-full bg-primary-200/30 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Creator Workspace
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Creator Workspace Belum Aktif
                </h1>
                <p className="text-sm text-slate-600">
                  {session?.user?.name || "Unknown User"} (
                  {session?.user?.email || "No email"})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge variant="primary">USER</StatusBadge>
                <StatusBadge variant={statusToBadgeVariant(applicationStatus)}>
                  {applicationStatus
                    ? getCreatorApplicationStatusLabel(applicationStatus)
                    : "Belum Apply"}
                </StatusBadge>
                <Button
                  intent="secondary"
                  onClick={handleSignOut}
                  loading={logoutMutation.isPending}
                >
                  Sign Out
                </Button>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              {myApplicationQuery.isLoading
                ? "Sedang memuat status pengajuan creator..."
                : lockedStateMessage}
            </p>
          </div>
        </section>

        <PanelCard
          className="rounded-3xl"
          title="Aksi yang Disarankan"
          description="Langkah tercepat agar akses creator bisa terbuka"
        >
          <div className="rounded-2xl border border-primary-300 bg-primary-50/60 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {recommendation.title}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-700">
              {recommendation.description}
            </p>
            <Link
              href={recommendation.href}
              className="mt-3 inline-flex rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
            >
              {recommendation.cta}
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/panel/creator-application/apply"
              className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                {applicationStatus
                  ? "Edit Pengajuan Creator"
                  : "Ajukan Creator"}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Lengkapi data payout dan dokumen untuk membuka workspace
                creator.
              </p>
            </Link>
            <Link
              href="/panel/creator-application/status"
              className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                Lihat Status Pengajuan
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Pantau status review dan catatan admin terbaru.
              </p>
            </Link>
          </div>
        </PanelCard>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary-50 p-6 shadow-xs">
        <div className="absolute -right-14 -top-12 h-40 w-40 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Creator Workspace
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Workspace Konten Ujian
              </h1>
              <p className="text-sm text-slate-600">
                {session?.user?.name || "Unknown User"} (
                {session?.user?.email || "No email"})
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                Gunakan quick actions untuk lanjut authoring, review, dan
                validasi publish.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge variant="primary">{role}</StatusBadge>
              <StatusBadge
                variant={
                  session?.user?.status === "ACTIVE" ? "success" : "danger"
                }
              >
                {session?.user?.status || "UNKNOWN"}
              </StatusBadge>
              <Button
                intent="secondary"
                onClick={handleSignOut}
                loading={logoutMutation.isPending}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PanelCard
        className="rounded-3xl"
        title="Aksi Direkomendasikan"
        description="Mulai dari langkah paling berdampak untuk sesi creator ini"
      >
        <div className="rounded-2xl border border-primary-300 bg-primary-50/60 p-4">
          <p className="text-sm font-semibold text-slate-900">
            {recommendation.title}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">
            {recommendation.description}
          </p>
          <Link
            href={recommendation.href}
            className="mt-3 inline-flex rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
          >
            {recommendation.cta}
          </Link>
        </div>
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Workspace Quick Actions"
        description="Arahkan aktivitas harian creator dari satu halaman"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workspaceActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                "rounded-2xl border p-4 transition-colors hover:bg-slate-50",
                action.highlighted
                  ? "border-primary-300 bg-primary-50/60"
                  : "border-slate-200 bg-white",
              )}
            >
              <p className="text-sm font-semibold text-slate-900">
                {action.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {action.description}
              </p>
              <p className="mt-3 text-xs font-medium text-primary-700">
                Buka halaman
              </p>
            </Link>
          ))}
        </div>
      </PanelCard>
    </main>
  )
}
