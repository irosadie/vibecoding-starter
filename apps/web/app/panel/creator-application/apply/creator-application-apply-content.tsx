"use client"

import { Button } from "$/components/button"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { authConfig } from "$/configs/auth"
import { useAuthLogout } from "$/hooks/transactions/use-auth"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type ChangeEvent, type FormEvent, useState } from "react"

type CreatorApplicationFormState = {
  payoutAccountName: string
  payoutBankName: string
  payoutAccountNumber: string
  ktpFile: File | null
}

type CreatorApplicationFormErrors = Partial<
  Record<keyof CreatorApplicationFormState, string>
>

type SubmittedApplicationPreview = {
  payoutAccountName: string
  payoutBankName: string
  payoutAccountNumber: string
  ktpFileName: string
  submittedAt: string
}

const initialFormState: CreatorApplicationFormState = {
  payoutAccountName: "",
  payoutBankName: "",
  payoutAccountNumber: "",
  ktpFile: null,
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

const validateForm = (
  form: CreatorApplicationFormState,
): CreatorApplicationFormErrors => {
  const errors: CreatorApplicationFormErrors = {}

  if (!form.payoutAccountName.trim()) {
    errors.payoutAccountName = "Nama pemilik rekening wajib diisi"
  }

  if (!form.payoutBankName.trim()) {
    errors.payoutBankName = "Nama bank wajib diisi"
  }

  if (!form.payoutAccountNumber.trim()) {
    errors.payoutAccountNumber = "Nomor rekening wajib diisi"
  }

  if (!form.ktpFile) {
    errors.ktpFile = "File KTP wajib diupload"
  }

  return errors
}

export default function CreatorApplicationApplyContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()
  const [formState, setFormState] =
    useState<CreatorApplicationFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<CreatorApplicationFormErrors>({})
  const [submittedPreview, setSubmittedPreview] =
    useState<SubmittedApplicationPreview | null>(null)
  const [ktpInputKey, setKtpInputKey] = useState(0)
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

    const nextErrors = validateForm(formState)

    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0 || !formState.ktpFile) {
      return
    }

    setSubmittedPreview({
      payoutAccountName: formState.payoutAccountName.trim(),
      payoutBankName: formState.payoutBankName.trim(),
      payoutAccountNumber: formState.payoutAccountNumber.trim(),
      ktpFileName: formState.ktpFile.name,
      submittedAt: new Date().toISOString(),
    })
    setFormState(initialFormState)
    setKtpInputKey((currentValue) => currentValue + 1)
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

      <PanelCard
        className="rounded-3xl"
        title="Form Pengajuan Creator"
        description="Data di bawah ini masih dummy untuk kebutuhan slicing halaman EA-4"
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
          <Button type="submit" intent="primary">
            Submit Creator Application
          </Button>
        </form>
      </PanelCard>

      {submittedPreview ? (
        <PanelCard
          className="rounded-3xl"
          title="Preview Payload Submit"
          description="Ringkasan data terakhir yang dikirim (dummy response)"
        >
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium">Payout account name:</span>{" "}
              {submittedPreview.payoutAccountName}
            </p>
            <p>
              <span className="font-medium">Payout bank:</span>{" "}
              {submittedPreview.payoutBankName}
            </p>
            <p>
              <span className="font-medium">Payout account number:</span>{" "}
              {submittedPreview.payoutAccountNumber}
            </p>
            <p>
              <span className="font-medium">KTP file:</span>{" "}
              {submittedPreview.ktpFileName}
            </p>
            <p>
              <span className="font-medium">Submitted at:</span>{" "}
              {formatDateTime(submittedPreview.submittedAt)}
            </p>
          </div>
        </PanelCard>
      ) : null}
    </main>
  )
}
