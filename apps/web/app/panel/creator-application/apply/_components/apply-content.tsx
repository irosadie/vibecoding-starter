"use client"

import { Button } from "$/components/button"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import { authConfig } from "$/configs/auth"
import { useAuthLogout } from "$/hooks/transactions/use-auth"
import {
  useCreatorApplicationGetOne,
  useCreatorApplicationInsertOne,
} from "$/hooks/transactions/use-creator-application"
import {
  creatorApplicationSchema,
  getCreatorApplicationStatusLabel,
} from "@vibecoding-starter/schemas"
import type { CreatorApplicationResponseProps } from "@vibecoding-starter/types"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react"

type CreatorApplicationFormState = {
  payoutAccountName: string
  payoutBankName: string
  payoutAccountNumber: string
  ktpFile: File | null
}

type CreatorApplicationFormErrors = Partial<
  Record<keyof CreatorApplicationFormState, string>
>

const initialFormState: CreatorApplicationFormState = {
  payoutAccountName: "",
  payoutBankName: "",
  payoutAccountNumber: "",
  ktpFile: null,
}

const statusVariantMap = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
} as const

const formChecklist = [
  "Pastikan nama pemilik rekening sesuai data bank aktif.",
  "Gunakan nomor rekening yang benar untuk payout creator.",
  "Upload file KTP yang jelas (gambar/PDF) agar review lebih cepat.",
]

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message
    }

    if (
      "errors" in error &&
      Array.isArray(error.errors) &&
      error.errors[0] &&
      typeof error.errors[0] === "object" &&
      "message" in error.errors[0] &&
      typeof error.errors[0].message === "string"
    ) {
      return error.errors[0].message
    }
  }

  return "Gagal mengirim pengajuan creator"
}

export default function CreatorApplicationApplyPageContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()
  const submitMutation = useCreatorApplicationInsertOne()
  const myApplicationQuery = useCreatorApplicationGetOne()

  const [formState, setFormState] =
    useState<CreatorApplicationFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<CreatorApplicationFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedPreview, setSubmittedPreview] =
    useState<CreatorApplicationResponseProps | null>(null)
  const [ktpInputKey, setKtpInputKey] = useState(0)

  const currentApplication = myApplicationQuery.data?.application ?? null
  const hasPendingApplication = currentApplication?.status === "PENDING"
  const ktpInputId = "creator-application-ktp-file"

  const submitButtonLabel = useMemo(() => {
    if (!currentApplication) {
      return "Submit Creator Application"
    }

    if (hasPendingApplication) {
      return "Menunggu Review Admin"
    }

    return "Kirim Ulang Pengajuan"
  }, [currentApplication, hasPendingApplication])

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace(authConfig.loginPath)
        router.refresh()
      },
    })
  }

  const handleInputChange =
    (field: keyof Omit<CreatorApplicationFormState, "ktpFile">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value

      setFormState((previousValue) => ({
        ...previousValue,
        [field]: value,
      }))
      setFormErrors((previousValue) => ({
        ...previousValue,
        [field]: undefined,
      }))
    }

  const handleKtpFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null

    setFormState((previousValue) => ({
      ...previousValue,
      ktpFile: nextFile,
    }))
    setFormErrors((previousValue) => ({
      ...previousValue,
      ktpFile: undefined,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const validation = creatorApplicationSchema.safeParse(formState)

    if (!validation.success) {
      const nextErrors: CreatorApplicationFormErrors = {}

      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0]

        if (typeof fieldName === "string" && !(fieldName in nextErrors)) {
          nextErrors[fieldName as keyof CreatorApplicationFormState] =
            issue.message
        }
      }

      setFormErrors(nextErrors)

      return
    }

    submitMutation.mutate(validation.data, {
      onSuccess: (result) => {
        setSubmittedPreview(result)
        setFormState(initialFormState)
        setKtpInputKey((currentValue) => currentValue + 1)
        myApplicationQuery.refetch()
      },
      onError: (error) => {
        setSubmitError(getErrorMessage(error))
      },
    })
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary-50 p-6 shadow-xs">
        <div className="absolute -right-16 -top-12 h-40 w-40 rounded-full bg-primary-200/35 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Creator Application Form
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Apply Creator
              </h1>
              <p className="text-sm text-slate-600">
                {session?.user?.name || "Unknown User"} (
                {session?.user?.email || "No email"})
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                Lengkapi data payout dan upload KTP untuk proses verifikasi
                admin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge variant="primary">
                {session?.user?.role || "USER"}
              </StatusBadge>
              {currentApplication?.status ? (
                <StatusBadge
                  variant={statusVariantMap[currentApplication.status]}
                >
                  {getCreatorApplicationStatusLabel(currentApplication.status)}
                </StatusBadge>
              ) : (
                <StatusBadge variant="neutral">Belum Apply</StatusBadge>
              )}
              <Button
                intent="secondary"
                onClick={handleSignOut}
                loading={logoutMutation.isPending}
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/panel"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Panel
            </Link>
            <Link
              href="/panel/creator-application/status"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Lihat Status Pengajuan
            </Link>
          </div>
        </div>
      </section>

      {currentApplication ? (
        <PanelCard
          className="rounded-3xl"
          title="Status Pengajuan Saat Ini"
          description="Pengajuan terbaru yang tersimpan di backend"
        >
          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <span className="font-medium">Status:</span>{" "}
              {getCreatorApplicationStatusLabel(currentApplication.status)}
            </p>
            <p>
              <span className="font-medium">Submitted at:</span>{" "}
              {formatDateTime(currentApplication.submittedAt)}
            </p>
            <p>
              <span className="font-medium">Reviewed at:</span>{" "}
              {currentApplication.reviewedAt
                ? formatDateTime(currentApplication.reviewedAt)
                : "-"}
            </p>
            <p>
              <span className="font-medium">Review note:</span>{" "}
              {currentApplication.reviewNote || "-"}
            </p>
          </div>
        </PanelCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PanelCard
          className="rounded-3xl"
          title="Sebelum Mengirim"
          description="Checklist agar pengajuan tidak tertunda saat review"
        >
          <ul className="space-y-2 text-sm text-slate-700">
            {formChecklist.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                {item}
              </li>
            ))}
          </ul>

          {hasPendingApplication ? (
            <p className="mt-4 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-sm text-warning-700">
              Kamu masih punya pengajuan dengan status pending. Tunggu review
              admin sebelum mengirim pengajuan baru.
            </p>
          ) : null}

          {submitError ? (
            <p className="mt-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {submitError}
            </p>
          ) : null}
        </PanelCard>

        <PanelCard
          className="rounded-3xl"
          title="Form Pengajuan Creator"
          description="Isi semua field wajib agar proses verifikasi berjalan lancar"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nama Pemilik Rekening"
              placeholder="Contoh: Imron Rosadie"
              required
              value={formState.payoutAccountName}
              onChange={handleInputChange("payoutAccountName")}
              error={formErrors.payoutAccountName}
              rounded="large"
              intent="clean"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nama Bank"
                placeholder="Contoh: BCA"
                required
                value={formState.payoutBankName}
                onChange={handleInputChange("payoutBankName")}
                error={formErrors.payoutBankName}
                rounded="large"
                intent="clean"
              />
              <Input
                label="Nomor Rekening"
                placeholder="Contoh: 1234567890"
                required
                value={formState.payoutAccountNumber}
                onChange={handleInputChange("payoutAccountNumber")}
                error={formErrors.payoutAccountNumber}
                rounded="large"
                intent="clean"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor={ktpInputId}
                className="text-sm font-medium text-main-500"
              >
                Upload KTP
                <span className="text-danger-500">*</span>
              </label>
              <input
                key={ktpInputKey}
                id={ktpInputId}
                type="file"
                accept="image/*,.pdf"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                onChange={handleKtpFileChange}
              />
              {formErrors.ktpFile ? (
                <p className="text-xs text-danger-500">{formErrors.ktpFile}</p>
              ) : formState.ktpFile ? (
                <p className="text-xs text-main-300">
                  File dipilih: {formState.ktpFile.name}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              intent="primary"
              loading={submitMutation.isPending}
              disabled={hasPendingApplication}
            >
              {submitButtonLabel}
            </Button>
          </form>
        </PanelCard>
      </div>

      {submittedPreview ? (
        <PanelCard
          className="rounded-3xl"
          title="Pengajuan Berhasil Dikirim"
          description="Ringkasan data submit terbaru dari API"
        >
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium">Application ID:</span>{" "}
              {submittedPreview.id}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              {getCreatorApplicationStatusLabel(submittedPreview.status)}
            </p>
            <p>
              <span className="font-medium">Submitted at:</span>{" "}
              {formatDateTime(submittedPreview.submittedAt)}
            </p>
            <Link
              href="/panel/creator-application/status"
              className="inline-flex rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Lihat progress status
            </Link>
          </div>
        </PanelCard>
      ) : myApplicationQuery.isLoading ? (
        <PanelCard
          className="rounded-3xl"
          title="Memuat Data"
          description="Sedang mengambil status pengajuan creator..."
        >
          <p className="text-sm text-slate-600">Mohon tunggu sebentar.</p>
        </PanelCard>
      ) : null}
    </main>
  )
}
