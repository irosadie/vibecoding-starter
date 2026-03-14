"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import type { StatusBadgeVariant } from "$/components/status-badge/status-badge"
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

type PanelAction = {
  id: string
  title: string
  description: string
  href: string
  highlighted?: boolean
  group: "core" | "workspace" | "support"
}

const creatorStatusToBadgeVariant = (
  status: CreatorApplicationStatus | null,
): StatusBadgeVariant => {
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

const getCreatorStatusLabel = (
  status: CreatorApplicationStatus | null,
  isLoading: boolean,
) => {
  if (isLoading) {
    return "Memuat status"
  }

  if (!status) {
    return "Belum apply creator"
  }

  return getCreatorApplicationStatusLabel(status)
}

export default function PanelPageContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()
  const role = session?.user?.role ?? "USER"
  const myApplicationQuery = useCreatorApplicationGetOne({
    enabled: role === "USER",
  })
  const applicationStatus =
    (myApplicationQuery.data?.application
      ?.status as CreatorApplicationStatus) ?? null
  const canOpenCreatorDashboard = role === "CREATOR" || role === "ADMIN"
  const canOpenAdminWorkspace = role === "ADMIN"
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

  const stageMessage = useMemo(() => {
    if (canOpenAdminWorkspace) {
      return "Akun admin aktif. Fokuskan sesi ini pada moderasi creator application dan review konten ujian."
    }

    if (canOpenCreatorDashboard) {
      return "Akses creator sudah aktif. Kamu bisa langsung lanjut menyusun konten ujian dan submit review."
    }

    if (applicationStatus === "PENDING") {
      return "Pengajuan creator sedang direview admin. Sambil menunggu, kamu tetap bisa gunakan katalog dan checkout."
    }

    if (applicationStatus === "APPROVED") {
      return "Pengajuan sudah approved. Jika workspace creator belum terbuka, logout lalu login ulang untuk refresh role."
    }

    if (applicationStatus === "REJECTED") {
      return "Pengajuan ditolak. Perbarui data payout dan dokumen KTP, lalu kirim ulang pengajuan."
    }

    return "Mulai dari jelajahi katalog ujian. Jika ingin menerbitkan konten, lanjutkan dengan pengajuan creator."
  }, [applicationStatus, canOpenAdminWorkspace, canOpenCreatorDashboard])

  const actions = useMemo<PanelAction[]>(() => {
    const actions: PanelAction[] = [
      {
        id: "catalog",
        title: "Jelajahi Katalog Ujian",
        description:
          "Lihat daftar exam publik beserta detail sebelum checkout.",
        href: "/exams",
        group: "core",
      },
      {
        id: "checkout",
        title: "Buka Checkout",
        description: "Kelola cart dan pantau status order pembayaran.",
        href: "/checkout",
        group: "core",
      },
    ]

    if (role === "USER") {
      actions.push({
        id: "status",
        title: "Status Pengajuan Creator",
        description:
          "Pantau progres pengajuan dari submit sampai aktivasi akun creator.",
        href: "/panel/creator-application/status",
        group: "workspace",
      })

      actions.push({
        id: "apply",
        title:
          applicationStatus === "PENDING"
            ? "Edit Pengajuan Creator"
            : "Ajukan Creator",
        description:
          applicationStatus === "PENDING"
            ? "Perbarui data payout atau file KTP pada pengajuan yang sedang diproses."
            : "Isi data payout dan upload KTP untuk mulai creator journey.",
        href: "/panel/creator-application/apply",
        highlighted: true,
        group: "workspace",
      })
    }

    if (canOpenCreatorDashboard) {
      actions.push({
        id: "creator",
        title: "Creator Workspace",
        description:
          "Kelola draft ujian, submit review, dan pantau feedback admin.",
        href: "/creator",
        highlighted: true,
        group: "workspace",
      })
    }

    if (canOpenAdminWorkspace) {
      actions.push({
        id: "admin-creator-review",
        title: "Admin Creator Review",
        description:
          "Approve/reject creator application dengan catatan review.",
        href: "/admin",
        group: "workspace",
      })
      actions.push({
        id: "admin-exam-review",
        title: "Admin Exam Review Queue",
        description:
          "Review submission exam dari creator dan publish konten final.",
        href: "/admin/exam-reviews",
        group: "workspace",
      })
    }

    actions.push({
      id: "home",
      title: "Kembali ke Beranda",
      description: "Lihat overview platform dan akses navigasi awal.",
      href: "/",
      group: "support",
    })

    return actions
  }, [applicationStatus, canOpenAdminWorkspace, canOpenCreatorDashboard, role])

  const actionGroups = useMemo(() => {
    const grouped = {
      core: [] as PanelAction[],
      workspace: [] as PanelAction[],
      support: [] as PanelAction[],
    }

    for (const action of actions) {
      grouped[action.group].push(action)
    }

    return grouped
  }, [actions])

  const recommendedActionId = useMemo(() => {
    if (canOpenAdminWorkspace) {
      return "admin-creator-review"
    }

    if (canOpenCreatorDashboard) {
      return "creator"
    }

    if (applicationStatus === "PENDING") {
      return "status"
    }

    if (applicationStatus === "REJECTED") {
      return "apply"
    }

    if (applicationStatus === "APPROVED") {
      return "status"
    }

    return "apply"
  }, [applicationStatus, canOpenAdminWorkspace, canOpenCreatorDashboard])

  const recommendedAction = useMemo(() => {
    return actions.find((action) => action.id === recommendedActionId) ?? null
  }, [actions, recommendedActionId])

  const recommendationMessage = useMemo(() => {
    if (canOpenAdminWorkspace) {
      return "Mulai dari review creator application supaya antrian moderasi tidak menumpuk."
    }

    if (canOpenCreatorDashboard) {
      return "Masuk ke creator workspace untuk melanjutkan authoring atau submit ujian."
    }

    if (applicationStatus === "PENDING") {
      return "Prioritas sekarang adalah memantau status review admin sampai role creator aktif."
    }

    if (applicationStatus === "REJECTED") {
      return "Perbaiki catatan review dan kirim ulang pengajuan creator."
    }

    if (applicationStatus === "APPROVED") {
      return "Status sudah approved. Cek halaman status lalu refresh sesi bila role creator belum berubah."
    }

    return "Langkah berikutnya: kirim pengajuan creator agar akses workspace creator bisa dibuka."
  }, [applicationStatus, canOpenAdminWorkspace, canOpenCreatorDashboard])

  const accountSummary = useMemo(() => {
    return [
      {
        id: "role",
        label: "Role aktif",
        value: role,
      },
      {
        id: "account-status",
        label: "Status akun",
        value: session?.user?.status || "UNKNOWN",
      },
      {
        id: "creator-status",
        label: "Status creator",
        value: getCreatorStatusLabel(
          applicationStatus,
          myApplicationQuery.isLoading,
        ),
      },
      {
        id: "available-features",
        label: "Fitur tersedia",
        value: `${actions.length} menu`,
      },
    ]
  }, [
    actions.length,
    applicationStatus,
    myApplicationQuery.isLoading,
    role,
    session?.user?.status,
  ])

  const journeyItems = useMemo<
    Array<{
      id: string
      title: string
      description: string
      variant: StatusBadgeVariant
      label: string
    }>
  >(() => {
    const hasSubmission = applicationStatus !== null
    const isApproved = applicationStatus === "APPROVED"
    const isPending = applicationStatus === "PENDING"
    const isRejected = applicationStatus === "REJECTED"

    return [
      {
        id: "account",
        title: "Akun aktif",
        description: "Autentikasi dan sesi sudah valid.",
        variant: "success" as const,
        label: "Done",
      },
      {
        id: "application",
        title: "Pengajuan creator",
        description: hasSubmission
          ? `Status saat ini: ${getCreatorApplicationStatusLabel(applicationStatus)}`
          : "Belum ada pengajuan creator.",
        variant: hasSubmission
          ? creatorStatusToBadgeVariant(applicationStatus)
          : ("neutral" as const),
        label: hasSubmission ? "Active" : "Waiting",
      },
      {
        id: "workspace",
        title: "Akses workspace creator",
        description: canOpenCreatorDashboard
          ? "Akses creator sudah aktif."
          : isApproved
            ? "Menunggu refresh sesi (logout-login ulang)."
            : isPending
              ? "Menunggu review admin."
              : isRejected
                ? "Butuh pengajuan ulang dengan data terbaru."
                : "Ajukan creator untuk membuka workspace ini.",
        variant: canOpenCreatorDashboard
          ? ("success" as const)
          : isRejected
            ? ("danger" as const)
            : ("warning" as const),
        label: canOpenCreatorDashboard ? "Unlocked" : "Locked",
      },
    ]
  }, [applicationStatus, canOpenCreatorDashboard])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary-50 p-6 shadow-xs">
        <div className="absolute -right-24 -top-16 h-56 w-56 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Platform Command Center
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                Halo, {session?.user?.name || "Unknown User"}
              </h1>
              <p className="text-sm text-slate-600">
                {session?.user?.email || "No email in session"}
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {stageMessage}
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
              <StatusBadge variant="primary">{role}</StatusBadge>
              <StatusBadge
                variant={
                  session?.user?.status === "ACTIVE" ? "success" : "danger"
                }
              >
                {session?.user?.status || "UNKNOWN"}
              </StatusBadge>
              {role === "USER" ? (
                <StatusBadge
                  variant={creatorStatusToBadgeVariant(applicationStatus)}
                >
                  {getCreatorStatusLabel(
                    applicationStatus,
                    myApplicationQuery.isLoading,
                  )}
                </StatusBadge>
              ) : null}
              <Button
                intent="secondary"
                onClick={handleSignOut}
                loading={logoutMutation.isPending}
                className="ml-auto md:ml-0"
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {accountSummary.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {isApprovedButRoleNotUpdated ? (
            <p className="mt-4 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-xs text-warning-800">
              Pengajuan creator sudah disetujui. Jika akses creator belum
              muncul, lakukan logout lalu login ulang untuk refresh session
              role.
            </p>
          ) : null}
        </div>
      </section>

      <PanelCard
        className="rounded-3xl"
        title="Aksi Direkomendasikan"
        description="Satu langkah paling penting untuk dilanjutkan pada sesi ini"
      >
        {recommendedAction ? (
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-primary-300 bg-primary-50/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-700">
                Next Best Action
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                {recommendedAction.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {recommendedAction.description}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {recommendationMessage}
              </p>
              <Link
                href={recommendedAction.href}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Lanjut sekarang
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">
                Tips onboarding
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
                <li>
                  Gunakan halaman status untuk memastikan progres creator selalu
                  terbaru.
                </li>
                <li>
                  Jika butuh publish konten, pastikan status creator tidak dalam
                  kondisi ditolak.
                </li>
                <li>
                  Katalog dan checkout tetap bisa dipakai sambil menunggu review
                  admin.
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            Belum ada aksi yang tersedia.
          </p>
        )}
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Semua Akses Fitur"
        description="Navigasi cepat sesuai kebutuhan belajar, creator, dan administrasi"
      >
        <div className="space-y-4">
          {actionGroups.core.length > 0 ? (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Aktivitas Belajar
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {actionGroups.core.map((action) => (
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
            </section>
          ) : null}

          {actionGroups.workspace.length > 0 ? (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Workflow Creator & Admin
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {actionGroups.workspace.map((action) => (
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
            </section>
          ) : null}

          {actionGroups.support.length > 0 ? (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Navigasi Tambahan
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {actionGroups.support.map((action) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
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
            </section>
          ) : null}
        </div>
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Progres Journey Akun"
        description="Pantau titik progress dari login sampai workspace creator aktif"
      >
        <div className="grid gap-3 md:grid-cols-3">
          {journeyItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <StatusBadge variant={item.variant}>{item.label}</StatusBadge>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </PanelCard>
    </main>
  )
}
