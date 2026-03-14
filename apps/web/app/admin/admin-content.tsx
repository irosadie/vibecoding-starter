"use client"

import { ActionsDropdown } from "$/components/actions-dropdown"
import { Button } from "$/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "$/components/dialog"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import { type ColumnDef, Table } from "$/components/table"
import { Textarea } from "$/components/textarea"
import { authConfig } from "$/configs/auth"
import { useAuthLogout } from "$/hooks/transactions/use-auth"
import {
  useCreatorApplicationDataTable,
  useCreatorApplicationDeleteOne,
  useCreatorApplicationUpdateOne,
} from "$/hooks/transactions/use-creator-application"
import {
  type CreatorApplicationStatus,
  getCreatorApplicationStatusLabel,
} from "@vibecoding-starter/schemas"
import type { CreatorApplicationWithApplicantResponseProps } from "@vibecoding-starter/types"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const statusVariantMap = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
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

  return "Terjadi kesalahan saat memproses review creator application"
}

export default function AdminContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()
  const approveMutation = useCreatorApplicationUpdateOne()
  const rejectMutation = useCreatorApplicationDeleteOne()

  const [search, setSearch] = useState("")
  const [selectedApplicationId, setSelectedApplicationId] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState("")
  const [rejectNote, setRejectNote] = useState("")
  const [reviewError, setReviewError] = useState<string | null>(null)

  const creatorApplicationsTable = useCreatorApplicationDataTable({
    isAutoFetch: true,
    page: 1,
    limit: 20,
    filter: {
      search: search.trim() || undefined,
    },
  })

  const applications = creatorApplicationsTable.data ?? []

  useEffect(() => {
    if (applications.length === 0) {
      setSelectedApplicationId("")

      return
    }

    const hasSelectedApplication = applications.some(
      (application) => application.id === selectedApplicationId,
    )

    if (!selectedApplicationId || !hasSelectedApplication) {
      setSelectedApplicationId(applications[0]?.id ?? "")
    }
  }, [applications, selectedApplicationId])

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace(authConfig.loginPath)
        router.refresh()
      },
    })
  }

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
  }

  const handleApproveApplication = (applicationId: string) => {
    setReviewError(null)
    approveMutation.mutate(
      {
        id: applicationId,
        payload: {
          review_note: "Approved by admin reviewer.",
        },
      },
      {
        onSuccess: () => {
          creatorApplicationsTable.refetch()
          setSelectedApplicationId(applicationId)
        },
        onError: (error) => {
          setReviewError(getErrorMessage(error))
        },
      },
    )
  }

  const handleOpenRejectDialog = (applicationId: string) => {
    setRejectTargetId(applicationId)
    setRejectNote("")
    setReviewError(null)
    setIsRejectDialogOpen(true)
    setSelectedApplicationId(applicationId)
  }

  const handleRejectApplication = () => {
    if (!rejectTargetId || !rejectNote.trim()) {
      return
    }

    setReviewError(null)
    rejectMutation.mutate(
      {
        id: rejectTargetId,
        payload: {
          review_note: rejectNote.trim(),
        },
      },
      {
        onSuccess: () => {
          creatorApplicationsTable.refetch()
          setIsRejectDialogOpen(false)
          setRejectTargetId("")
          setRejectNote("")
        },
        onError: (error) => {
          setReviewError(getErrorMessage(error))
        },
      },
    )
  }

  const selectedApplication = useMemo(
    () =>
      applications.find(
        (application) => application.id === selectedApplicationId,
      ) ?? null,
    [applications, selectedApplicationId],
  )

  const columns: ColumnDef<CreatorApplicationWithApplicantResponseProps>[] = [
    {
      accessorKey: "applicant",
      header: "Applicant",
      cell: (info) => {
        const applicant =
          info.getValue() as CreatorApplicationWithApplicantResponseProps["applicant"]

        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-gray-900">
              {applicant.name}
            </p>
            <p className="text-xs text-gray-500">{applicant.email}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "payout_bank_name",
      header: "Payout",
      cell: (info) => {
        const row = info.row.original

        return (
          <div className="space-y-0.5 text-sm text-gray-700">
            <p>{row.payout_bank_name}</p>
            <p className="text-xs text-gray-500">{row.payout_account_number}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "submitted_at",
      header: "Submitted At",
      cell: (info) => (
        <span className="text-sm text-gray-700">
          {formatDateTime(info.getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as CreatorApplicationStatus

        return (
          <StatusBadge variant={statusVariantMap[status]}>
            {getCreatorApplicationStatusLabel(status)}
          </StatusBadge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: (info) => {
        const row = info.row.original
        const actions =
          row.status === "PENDING"
            ? [
                {
                  label: "Approve",
                  onClick: () => handleApproveApplication(row.id),
                },
                {
                  label: "Reject",
                  onClick: () => handleOpenRejectDialog(row.id),
                  destructive: true,
                },
                {
                  label: "Open Detail",
                  onClick: () => handleSelectApplication(row.id),
                },
              ]
            : [
                {
                  label: "Open Detail",
                  onClick: () => handleSelectApplication(row.id),
                },
              ]

        return <ActionsDropdown actions={actions} />
      },
    },
  ]

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <PanelCard
        className="rounded-3xl"
        title="Admin Creator Review"
        description="Review pengajuan creator: approve atau reject dengan catatan"
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
        <div className="mt-4">
          <Link
            href="/panel/creator-application/status"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Buka Halaman Status User
          </Link>
        </div>
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Daftar Pengajuan Creator"
        description="Data diambil dari endpoint admin creator applications"
      >
        <div className="mb-4">
          <Input
            label="Cari Pengajuan"
            placeholder="Cari nama atau email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            rounded="large"
            intent="clean"
          />
        </div>
        {creatorApplicationsTable.error ? (
          <p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            Gagal memuat daftar pengajuan creator.
          </p>
        ) : null}
        {reviewError ? (
          <p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {reviewError}
          </p>
        ) : null}
        <Table
          data={applications}
          columns={columns}
          isShowPagination={false}
          isLoading={creatorApplicationsTable.isLoading}
          onRowClick={(row) => handleSelectApplication(row.original.id)}
          thClassName="whitespace-nowrap"
        />
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Detail Pengajuan"
        description="Klik baris tabel atau action Open Detail untuk melihat detail"
      >
        {selectedApplication ? (
          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <span className="font-medium">Application ID:</span>{" "}
              {selectedApplication.id}
            </p>
            <p>
              <span className="font-medium">Applicant:</span>{" "}
              {selectedApplication.applicant.name}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {selectedApplication.applicant.email}
            </p>
            <p>
              <span className="font-medium">Payout account:</span>{" "}
              {selectedApplication.payout_account_name}
            </p>
            <p>
              <span className="font-medium">Payout bank:</span>{" "}
              {selectedApplication.payout_bank_name}
            </p>
            <p>
              <span className="font-medium">Payout account number:</span>{" "}
              {selectedApplication.payout_account_number}
            </p>
            <p>
              <span className="font-medium">Submitted at:</span>{" "}
              {formatDateTime(selectedApplication.submitted_at)}
            </p>
            <p>
              <span className="font-medium">Reviewed at:</span>{" "}
              {formatDateTime(selectedApplication.reviewed_at)}
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">KTP file:</span>{" "}
              <a
                href={selectedApplication.ktp_file_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 underline underline-offset-2"
              >
                {selectedApplication.ktp_file_url}
              </a>
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">Review note:</span>{" "}
              {selectedApplication.review_note || "-"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Belum ada data yang dipilih.</p>
        )}
      </PanelCard>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject Creator Application</DialogTitle>
            <DialogDescription>
              Isi catatan review sebelum menolak pengajuan creator.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            label="Review Note"
            placeholder="Contoh: Foto KTP blur, mohon upload ulang."
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            required
            rounded="large"
            intent="clean"
          />
          <DialogFooter>
            <Button
              type="button"
              intent="secondary"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              intent="danger"
              onClick={handleRejectApplication}
              loading={rejectMutation.isPending}
              disabled={!rejectNote.trim()}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
