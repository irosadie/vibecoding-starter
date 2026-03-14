"use client"

import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import { useCreatorApplicationGetOne } from "$/hooks/transactions/use-creator-application"
import {
  type CreatorApplicationStatus,
  getCreatorApplicationStatusLabel,
} from "@vibecoding-starter/schemas"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useMemo } from "react"

type CreatorApplicationStep = {
  id: string
  title: string
  description: string
  status: "done" | "active" | "waiting"
}

const statusVariantMap = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
} as const

const statusDescriptionMap: Record<CreatorApplicationStatus, string> = {
  PENDING: "Admin belum mereview pengajuan. Mohon tunggu proses verifikasi.",
  APPROVED:
    "Pengajuan disetujui. Lakukan refresh sesi bila role creator belum berubah.",
  REJECTED:
    "Pengajuan ditolak. Perbaiki data payout atau dokumen KTP lalu ajukan ulang.",
}

const stepVariantMap = {
  done: "success",
  active: "warning",
  waiting: "neutral",
} as const

const stepLabelMap = {
  done: "Done",
  active: "Active",
  waiting: "Waiting",
} as const

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function CreatorApplicationStatusPageContent() {
  const { data: session } = useSession()
  const myApplicationQuery = useCreatorApplicationGetOne()
  const application = myApplicationQuery.data?.application ?? null
  const status = application?.status ?? null

  const steps = useMemo<CreatorApplicationStep[]>(() => {
    if (!application || !status) {
      return [
        {
          id: "submitted",
          title: "Pengajuan terkirim",
          description: "Data payout dan KTP belum dikirim.",
          status: "waiting",
        },
        {
          id: "reviewed",
          title: "Review admin",
          description: "Review dimulai setelah pengajuan berhasil dikirim.",
          status: "waiting",
        },
        {
          id: "activated",
          title: "Aktivasi creator",
          description: "Akses creator aktif setelah pengajuan disetujui.",
          status: "waiting",
        },
      ]
    }

    if (status === "PENDING") {
      return [
        {
          id: "submitted",
          title: "Pengajuan terkirim",
          description: "Data payout dan file KTP berhasil tersimpan.",
          status: "done",
        },
        {
          id: "reviewed",
          title: "Review admin",
          description: "Admin mengecek kelengkapan payout dan validitas KTP.",
          status: "active",
        },
        {
          id: "activated",
          title: "Aktivasi creator",
          description: "Role creator diaktifkan jika pengajuan disetujui.",
          status: "waiting",
        },
      ]
    }

    if (status === "APPROVED") {
      return [
        {
          id: "submitted",
          title: "Pengajuan terkirim",
          description: "Data payout dan file KTP berhasil tersimpan.",
          status: "done",
        },
        {
          id: "reviewed",
          title: "Review admin",
          description: "Pengajuan sudah direview admin.",
          status: "done",
        },
        {
          id: "activated",
          title: "Aktivasi creator",
          description: "Akses creator bisa digunakan setelah refresh sesi.",
          status: "active",
        },
      ]
    }

    return [
      {
        id: "submitted",
        title: "Pengajuan terkirim",
        description: "Data payout dan file KTP sudah diterima sistem.",
        status: "done",
      },
      {
        id: "reviewed",
        title: "Review admin",
        description: "Pengajuan sudah direview dengan catatan perbaikan.",
        status: "done",
      },
      {
        id: "activated",
        title: "Aktivasi creator",
        description: "Perlu submit ulang data yang diminta admin.",
        status: "active",
      },
    ]
  }, [application, status])

  const nextAction = useMemo(() => {
    if (!application || !status) {
      return {
        title: "Kirim pengajuan creator",
        description:
          "Lengkapi data payout dan dokumen KTP untuk mulai proses review.",
        href: "/panel/creator-application/apply",
        cta: "Isi form apply",
      }
    }

    if (status === "PENDING") {
      return {
        title: "Pantau proses review",
        description:
          "Pengajuan sedang diproses admin. Tidak perlu submit ulang saat masih pending.",
        href: "/panel",
        cta: "Kembali ke panel",
      }
    }

    if (status === "APPROVED") {
      return {
        title: "Masuk ke creator workspace",
        description:
          "Jika role creator belum terbaca, logout-login ulang lalu akses workspace creator.",
        href: "/creator",
        cta: "Buka workspace creator",
      }
    }

    return {
      title: "Perbaiki pengajuan",
      description:
        "Tinjau catatan review admin, lalu update data payout dan dokumen.",
      href: "/panel/creator-application/apply",
      cta: "Perbarui pengajuan",
    }
  }, [application, status])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary-50 p-6 shadow-xs">
        <div className="absolute -right-20 -top-14 h-44 w-44 rounded-full bg-primary-200/35 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Creator Application
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Status Pengajuan Creator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {session?.user?.name || "Unknown User"} (
            {session?.user?.email || "No email"})
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge variant="primary">USER</StatusBadge>
            <StatusBadge
              variant={status ? statusVariantMap[status] : "neutral"}
            >
              {status
                ? getCreatorApplicationStatusLabel(status)
                : "Belum Apply"}
            </StatusBadge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/panel"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Panel
            </Link>
            <Link
              href="/panel/creator-application/apply"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Buka Form Pengajuan
            </Link>
          </div>
        </div>
      </section>

      <PanelCard
        className="rounded-3xl"
        title="Ringkasan Status"
        description="Informasi status langsung dari backend creator application"
      >
        {myApplicationQuery.isLoading ? (
          <p className="text-sm text-slate-600">
            Sedang memuat status pengajuan creator...
          </p>
        ) : myApplicationQuery.error ? (
          <p className="rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            Gagal memuat status pengajuan creator.
          </p>
        ) : !application || !status ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Belum ada pengajuan creator yang tersimpan.
            </p>
            <Link
              href="/panel/creator-application/apply"
              className="inline-flex rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Mulai pengajuan creator
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge variant={statusVariantMap[status]}>
                  {getCreatorApplicationStatusLabel(status)}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {statusDescriptionMap[status]}
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Submitted at:</span>{" "}
                  {formatDateTime(application.submittedAt)}
                </p>
                <p>
                  <span className="font-medium">Reviewed at:</span>{" "}
                  {formatDateTime(application.reviewedAt)}
                </p>
                <p>
                  <span className="font-medium">Review note:</span>{" "}
                  {application.reviewNote || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-primary-300 bg-primary-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-700">
                Next Action
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {nextAction.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                {nextAction.description}
              </p>
              <Link
                href={nextAction.href}
                className="mt-4 inline-flex rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
              >
                {nextAction.cta}
              </Link>
            </div>
          </div>
        )}
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Progress Pengajuan"
        description="Timeline proses submit sampai aktivasi creator"
      >
        <ol className="space-y-3">
          {steps.map((step) => (
            <li
              key={step.id}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <StatusBadge
                  variant={stepVariantMap[step.status]}
                  className="min-w-[70px] justify-center"
                >
                  {stepLabelMap[step.status]}
                </StatusBadge>
                <p className="text-sm font-medium text-gray-900">
                  {step.title}
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </PanelCard>
    </main>
  )
}
