"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useMemo, useState } from "react"

type CreatorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED"

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

const statusLabelMap = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const

const statusDescriptionMap: Record<CreatorApplicationStatus, string> = {
  PENDING: "Admin belum mereview pengajuan. Mohon tunggu proses verifikasi.",
  APPROVED:
    "Pengajuan sudah disetujui. Role akun akan dipromosikan menjadi creator.",
  REJECTED:
    "Pengajuan ditolak. Silakan perbaiki data payout/KTP lalu submit ulang.",
}

const reviewNoteMap: Record<CreatorApplicationStatus, string | null> = {
  PENDING: null,
  APPROVED: "Dokumen KTP valid dan data payout sesuai.",
  REJECTED:
    "Nama pemilik rekening tidak sama dengan identitas pada KTP. Mohon perbaiki.",
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

export default function CreatorApplicationStatusContent() {
  const { data: session } = useSession()
  const [status, setStatus] = useState<CreatorApplicationStatus>("PENDING")
  const submittedAt = "2026-03-14T08:20:00.000Z"
  const reviewedAt = useMemo(() => {
    if (status === "PENDING") {
      return null
    }

    return "2026-03-14T11:10:00.000Z"
  }, [status])

  const steps = useMemo<CreatorApplicationStep[]>(
    () => [
      {
        id: "submitted",
        title: "Pengajuan terkirim",
        description: "Data payout dan file KTP berhasil tersimpan.",
        isDone: true,
      },
      {
        id: "reviewed",
        title: "Review admin",
        description: "Admin mengecek kelengkapan payout dan validitas KTP.",
        isDone: status !== "PENDING",
      },
      {
        id: "activated",
        title: "Aktivasi creator",
        description: "Role creator diaktifkan ketika pengajuan disetujui.",
        isDone: status === "APPROVED",
      },
    ],
    [status],
  )

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
        description="Data status di bawah ini masih dummy untuk kebutuhan slicing EA-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge variant={statusVariantMap[status]}>
            {statusLabelMap[status]}
          </StatusBadge>
          <span className="text-sm text-slate-600">
            {statusDescriptionMap[status]}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            intent={status === "PENDING" ? "primary" : "secondary"}
            onClick={() => setStatus("PENDING")}
          >
            Preview Pending
          </Button>
          <Button
            type="button"
            intent={status === "APPROVED" ? "primary" : "secondary"}
            onClick={() => setStatus("APPROVED")}
          >
            Preview Approved
          </Button>
          <Button
            type="button"
            intent={status === "REJECTED" ? "danger" : "secondary"}
            onClick={() => setStatus("REJECTED")}
          >
            Preview Rejected
          </Button>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium">Submitted at:</span>{" "}
            {formatDateTime(submittedAt)}
          </p>
          <p>
            <span className="font-medium">Reviewed at:</span>{" "}
            {reviewedAt ? formatDateTime(reviewedAt) : "-"}
          </p>
          {reviewNoteMap[status] ? (
            <p>
              <span className="font-medium">Review note:</span>{" "}
              {reviewNoteMap[status]}
            </p>
          ) : null}
        </div>
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
