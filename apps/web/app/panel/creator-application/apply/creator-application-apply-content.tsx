"use client"

import { Button } from "$/components/button"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
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
import { type ChangeEvent, type FormEvent, useState } from "react"

type CreatorApplicationFormState = {
  payout_account_name: string
  payout_bank_name: string
  payout_account_number: string
  ktp_file: File | null
}

type CreatorApplicationFormErrors = Partial<
  Record<keyof CreatorApplicationFormState, string>
>

const initialFormState: CreatorApplicationFormState = {
  payout_account_name: "",
  payout_bank_name: "",
  payout_account_number: "",
  ktp_file: null,
}

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

export default function CreatorApplicationApplyContent() {
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

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace(authConfig.loginPath)
        router.refresh()
      },
    })
  }

  const handleInputChange =
    (field: keyof Omit<CreatorApplicationFormState, "ktp_file">) =>
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
      ktp_file: nextFile,
    }))
    setFormErrors((previousValue) => ({
      ...previousValue,
      ktp_file: undefined,
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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <PanelCard
        className="rounded-3xl"
        title="Apply Creator"
        description="Ajukan upgrade akun creator dengan data payout dan upload KTP"
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
        <div className="space-y-1 text-sm text-slate-600">
          <p>
            Signed in as{" "}
            <span className="font-medium text-slate-900">
              {session?.user?.name || "Unknown User"}
            </span>
          </p>
          <p>{session?.user?.email || "No email in session"}</p>
          <p>Role: {session?.user?.role || "UNKNOWN"}</p>
        </div>
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

      {currentApplication ? (
        <PanelCard
          className="rounded-3xl"
          title="Status Pengajuan Saat Ini"
          description="Pengajuan terbaru yang tersimpan di backend"
        >
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium">Status:</span>{" "}
              {getCreatorApplicationStatusLabel(currentApplication.status)}
            </p>
            <p>
              <span className="font-medium">Submitted at:</span>{" "}
              {formatDateTime(currentApplication.submitted_at)}
            </p>
            {currentApplication.reviewed_at ? (
              <p>
                <span className="font-medium">Reviewed at:</span>{" "}
                {formatDateTime(currentApplication.reviewed_at)}
              </p>
            ) : null}
            {currentApplication.review_note ? (
              <p>
                <span className="font-medium">Review note:</span>{" "}
                {currentApplication.review_note}
              </p>
            ) : null}
          </div>
        </PanelCard>
      ) : null}

      <PanelCard
        className="rounded-3xl"
        title="Form Pengajuan Creator"
        description="Lengkapi data payout dan upload KTP untuk verifikasi admin"
      >
        {hasPendingApplication ? (
          <p className="mb-4 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-sm text-warning-700">
            Kamu masih punya pengajuan dengan status pending. Tunggu review
            admin sebelum mengirim pengajuan baru.
          </p>
        ) : null}
        {submitError ? (
          <p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {submitError}
          </p>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nama Pemilik Rekening"
            placeholder="Contoh: Imron Rosadie"
            required
            value={formState.payout_account_name}
            onChange={handleInputChange("payout_account_name")}
            error={formErrors.payout_account_name}
            rounded="large"
            intent="clean"
          />
          <Input
            label="Nama Bank"
            placeholder="Contoh: BCA"
            required
            value={formState.payout_bank_name}
            onChange={handleInputChange("payout_bank_name")}
            error={formErrors.payout_bank_name}
            rounded="large"
            intent="clean"
          />
          <Input
            label="Nomor Rekening"
            placeholder="Contoh: 1234567890"
            required
            value={formState.payout_account_number}
            onChange={handleInputChange("payout_account_number")}
            error={formErrors.payout_account_number}
            rounded="large"
            intent="clean"
          />
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
            {formErrors.ktp_file ? (
              <p className="text-xs text-danger-500">{formErrors.ktp_file}</p>
            ) : formState.ktp_file ? (
              <p className="text-xs text-main-300">
                File dipilih: {formState.ktp_file.name}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            intent="primary"
            loading={submitMutation.isPending}
            disabled={hasPendingApplication}
          >
            Submit Creator Application
          </Button>
        </form>
      </PanelCard>

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
              {formatDateTime(submittedPreview.submitted_at)}
            </p>
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
