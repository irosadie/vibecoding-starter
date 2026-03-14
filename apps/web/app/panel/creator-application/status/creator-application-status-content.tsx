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
  isDone: boolean
}

const statusVariantMap = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
} as const

const statusDescriptionMap: Record<CreatorApplicationStatus, string> = {
  PENDING: "Admin belum mereview pengajuan. Mohon tunggu proses verifikasi.",
  APPROVED:
    "Pengajuan sudah disetujui. Role akun akan dipromosikan menjadi creator.",
  REJECTED:
    "Pengajuan ditolak. Silakan perbaiki data payout/KTP lalu submit ulang.",
}

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function CreatorApplicationStatusContent() {
  const { data: session } = useSession()
  const myApplicationQuery = useCreatorApplicationGetOne()
  const application = myApplicationQuery.data?.application ?? null
  const status = application?.status ?? null

  const steps = useMemo<CreatorApplicationStep[]>(() => {
    const isReviewed = status !== null && status !== "PENDING"
    const isActivated = status === "APPROVED"

    return [
      {
        id: "submitted",
        title: "Pengajuan terkirim",
        description: "Data payout dan file KTP berhasil tersimpan.",
        isDone: Boolean(application),
      },
      {
        id: "reviewed",
        title: "Review admin",
        description: "Admin mengecek kelengkapan payout dan validitas KTP.",
        isDone: isReviewed,
      },
      {
        id: "activated",
        title: "Aktivasi creator",
        description: "Role creator diaktifkan ketika pengajuan disetujui.",
        isDone: isActivated,
      },
    ]
  }, [application, status])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <PanelCard
        className="rounded-3xl"
        title="Status Pengajuan Creator"
        description="Halaman ini menampilkan status terbaru creator application"
      >
        <div className="space-y-1 text-sm text-slate-600">
          <p>
            User:{" "}
            <span className="font-medium text-slate-900">
              {session?.user?.name || "Unknown User"}
            </span>
          </p>
          <p>{session?.user?.email || "No email in session"}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/panel"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Kembali ke Panel
          </Link>
          <Link
            href="/panel/creator-application/apply"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Edit Pengajuan
          </Link>
        </div>
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Ringkasan Status"
        description="Status diambil langsung dari backend creator application"
      >
        {myApplicationQuery.isLoading ? (
          <p className="text-sm text-slate-600">
            Sedang memuat status pengajuan creator...
          </p>
        ) : myApplicationQuery.error ? (
          <p className="text-sm text-danger-600">
            Gagal memuat status pengajuan creator.
          </p>
        ) : !application || !status ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Belum ada pengajuan creator. Silakan submit pengajuan terlebih
              dahulu.
            </p>
            <Link
              href="/panel/creator-application/apply"
              className="inline-flex rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Buka Form Apply Creator
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge variant={statusVariantMap[status]}>
                {getCreatorApplicationStatusLabel(status)}
              </StatusBadge>
              <span className="text-sm text-slate-600">
                {statusDescriptionMap[status]}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium">Submitted at:</span>{" "}
                {formatDateTime(application.submitted_at)}
              </p>
              <p>
                <span className="font-medium">Reviewed at:</span>{" "}
                {formatDateTime(application.reviewed_at)}
              </p>
              {application.review_note ? (
                <p>
                  <span className="font-medium">Review note:</span>{" "}
                  {application.review_note}
                </p>
              ) : null}
              {status === "APPROVED" ? (
                <div className="pt-2">
                  <Link
                    href="/creator"
                    className="inline-flex rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                  >
                    Buka Creator Dashboard
                  </Link>
                </div>
              ) : null}
            </div>
          </>
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
                  variant={step.isDone ? "success" : "neutral"}
                  className="min-w-[70px] justify-center"
                >
                  {step.isDone ? "Done" : "Waiting"}
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
