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
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type CreatorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED"

type CreatorApplicationReviewItem = {
  id: string
  applicantName: string
  applicantEmail: string
  payoutAccountName: string
  payoutBankName: string
  payoutAccountNumber: string
  ktpFileUrl: string
  submittedAt: string
  status: CreatorApplicationStatus
  reviewNote: string | null
  reviewedAt: string | null
}

const statusVariantMap = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
} as const

const statusLabelMap = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const

const initialApplications: CreatorApplicationReviewItem[] = [
  {
    id: "ca-0001",
    applicantName: "Imron Rosadie",
    applicantEmail: "imronrosadie@gmail.com",
    payoutAccountName: "Imron Rosadie",
    payoutBankName: "BCA",
    payoutAccountNumber: "1234567890",
    ktpFileUrl: "https://example.com/files/ca-0001-ktp.jpg",
    submittedAt: "2026-03-14T09:30:00.000Z",
    status: "PENDING",
    reviewNote: null,
    reviewedAt: null,
  },
  {
    id: "ca-0002",
    applicantName: "Dina Larasati",
    applicantEmail: "dina.larasati@example.com",
    payoutAccountName: "Dina Larasati",
    payoutBankName: "Mandiri",
    payoutAccountNumber: "980001234567",
    ktpFileUrl: "https://example.com/files/ca-0002-ktp.jpg",
    submittedAt: "2026-03-12T14:10:00.000Z",
    status: "APPROVED",
    reviewNote: "Dokumen valid dan data payout sesuai identitas.",
    reviewedAt: "2026-03-12T16:15:00.000Z",
  },
  {
    id: "ca-0003",
    applicantName: "Rafi Pratama",
    applicantEmail: "rafi.pratama@example.com",
    payoutAccountName: "Rafi Pratama",
    payoutBankName: "BRI",
    payoutAccountNumber: "002122334455",
    ktpFileUrl: "https://example.com/files/ca-0003-ktp.jpg",
    submittedAt: "2026-03-11T11:05:00.000Z",
    status: "REJECTED",
    reviewNote:
      "Foto KTP blur, mohon upload ulang dengan kualitas lebih jelas.",
    reviewedAt: "2026-03-11T13:40:00.000Z",
  },
]

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function AdminContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const logoutMutation = useAuthLogout()
  const [applications, setApplications] =
    useState<CreatorApplicationReviewItem[]>(initialApplications)
  const [search, setSearch] = useState("")
  const [selectedApplicationId, setSelectedApplicationId] = useState(
    initialApplications[0]?.id ?? "",
  )
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState("")
  const [rejectNote, setRejectNote] = useState("")

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
    const reviewedAt = new Date().toISOString()

    setApplications((previousValue) =>
      previousValue.map((application) => {
        if (application.id !== applicationId) {
          return application
        }

        return {
          ...application,
          status: "APPROVED",
          reviewNote: "Approved by admin reviewer.",
          reviewedAt,
        }
      }),
    )
    setSelectedApplicationId(applicationId)
  }

  const handleOpenRejectDialog = (applicationId: string) => {
    setRejectTargetId(applicationId)
    setRejectNote("")
    setIsRejectDialogOpen(true)
    setSelectedApplicationId(applicationId)
  }

  const handleRejectApplication = () => {
    if (!rejectTargetId || !rejectNote.trim()) {
      return
    }

    const reviewedAt = new Date().toISOString()

    setApplications((previousValue) =>
      previousValue.map((application) => {
        if (application.id !== rejectTargetId) {
          return application
        }

        return {
          ...application,
          status: "REJECTED",
          reviewNote: rejectNote.trim(),
          reviewedAt,
        }
      }),
    )
    setIsRejectDialogOpen(false)
    setRejectTargetId("")
    setRejectNote("")
  }

  const filteredApplications = useMemo(
    () =>
      applications.filter((application) => {
        const keyword = search.trim().toLowerCase()

        if (!keyword) {
          return true
        }

        return (
          application.applicantName.toLowerCase().includes(keyword) ||
          application.applicantEmail.toLowerCase().includes(keyword) ||
          application.status.toLowerCase().includes(keyword)
        )
      }),
    [applications, search],
  )

  const selectedApplication = useMemo(
    () =>
      applications.find(
        (application) => application.id === selectedApplicationId,
      ) ?? null,
    [applications, selectedApplicationId],
  )

  const columns: ColumnDef<CreatorApplicationReviewItem>[] = [
    {
      accessorKey: "applicantName",
      header: "Applicant",
      cell: (info) => {
        const row = info.row.original

        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-gray-900">
              {row.applicantName}
            </p>
            <p className="text-xs text-gray-500">{row.applicantEmail}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "payoutBankName",
      header: "Payout",
      cell: (info) => {
        const row = info.row.original

        return (
          <div className="space-y-0.5 text-sm text-gray-700">
            <p>{row.payoutBankName}</p>
            <p className="text-xs text-gray-500">{row.payoutAccountNumber}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "submittedAt",
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
            {statusLabelMap[status]}
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
        description="Data berikut dummy untuk slicing ticket EA-4"
      >
        <div className="mb-4">
          <Input
            label="Cari Pengajuan"
            placeholder="Cari nama, email, atau status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            rounded="large"
            intent="clean"
          />
        </div>
        <Table
          data={filteredApplications}
          columns={columns}
          isShowPagination={false}
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
              {selectedApplication.applicantName}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {selectedApplication.applicantEmail}
            </p>
            <p>
              <span className="font-medium">Payout account:</span>{" "}
              {selectedApplication.payoutAccountName}
            </p>
            <p>
              <span className="font-medium">Payout bank:</span>{" "}
              {selectedApplication.payoutBankName}
            </p>
            <p>
              <span className="font-medium">Payout account number:</span>{" "}
              {selectedApplication.payoutAccountNumber}
            </p>
            <p>
              <span className="font-medium">Submitted at:</span>{" "}
              {formatDateTime(selectedApplication.submittedAt)}
            </p>
            <p>
              <span className="font-medium">Reviewed at:</span>{" "}
              {formatDateTime(selectedApplication.reviewedAt)}
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">KTP file:</span>{" "}
              <a
                href={selectedApplication.ktpFileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 underline underline-offset-2"
              >
                {selectedApplication.ktpFileUrl}
              </a>
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">Review note:</span>{" "}
              {selectedApplication.reviewNote || "-"}
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
