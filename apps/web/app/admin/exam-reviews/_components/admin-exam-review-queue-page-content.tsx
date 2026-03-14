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
import {
  useExamAuthoringReviewAdminApproveOne,
  useExamAuthoringReviewAdminDataTable,
  useExamAuthoringReviewAdminGetOne,
  useExamAuthoringReviewAdminRejectOne,
} from "$/hooks/transactions/use-exam-authoring-review"
import {
  type ExamAuthoringReviewStatus,
  getExamAuthoringReviewStatusLabel,
} from "@vibecoding-starter/schemas"
import type { AdminExamReviewSummaryResponseProps } from "@vibecoding-starter/types"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

const statusVariantMap: Record<
  ExamAuthoringReviewStatus,
  "success" | "warning" | "danger"
> = {
  IN_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "danger",
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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object") {
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

    if ("message" in error && typeof error.message === "string") {
      return error.message
    }
  }

  return fallback
}

export default function AdminExamReviewQueuePageContent() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const hasAdminAccess = role === "ADMIN"

  const [search, setSearch] = useState("")
  const [selectedReviewId, setSelectedReviewId] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState("")
  const [rejectNote, setRejectNote] = useState("")
  const [rejectError, setRejectError] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const reviewQueueTable = useExamAuthoringReviewAdminDataTable({
    isAutoFetch: hasAdminAccess,
    page: 1,
    limit: 20,
    filter: {
      search: search.trim() || undefined,
    },
  })
  const approveMutation = useExamAuthoringReviewAdminApproveOne()
  const rejectMutation = useExamAuthoringReviewAdminRejectOne()

  const queue = reviewQueueTable.data ?? []
  const selectedReviewQuery = useExamAuthoringReviewAdminGetOne({
    id: selectedReviewId,
    enabled: hasAdminAccess && Boolean(selectedReviewId),
  })

  useEffect(() => {
    if (queue.length === 0) {
      setSelectedReviewId("")
      return
    }

    const hasSelectedReview = queue.some((item) => item.id === selectedReviewId)

    if (!hasSelectedReview) {
      setSelectedReviewId(queue[0]?.id || "")
    }
  }, [queue, selectedReviewId])

  const selectedItem = selectedReviewQuery.data ?? null

  const summary = useMemo(() => {
    return {
      inReview: queue.filter((item) => item.status === "IN_REVIEW").length,
      published: queue.filter((item) => item.status === "PUBLISHED").length,
      rejected: queue.filter((item) => item.status === "REJECTED").length,
    }
  }, [queue])

  const handleApprove = (reviewId: string) => {
    setActionError(null)

    approveMutation.mutate(
      {
        id: reviewId,
      },
      {
        onSuccess: () => {
          reviewQueueTable.refetch()
          selectedReviewQuery.refetch()
          setSelectedReviewId(reviewId)
        },
        onError: (error) => {
          setActionError(
            getErrorMessage(error, "Gagal approve exam review submission."),
          )
        },
      },
    )
  }

  const handleOpenRejectDialog = (reviewId: string) => {
    setRejectTargetId(reviewId)
    setRejectNote("")
    setRejectError("")
    setActionError(null)
    setSelectedReviewId(reviewId)
    setIsRejectDialogOpen(true)
  }

  const handleConfirmReject = () => {
    const normalizedNote = rejectNote.trim()

    if (normalizedNote.length < 3) {
      setRejectError("Catatan reject minimal 3 karakter")
      return
    }

    setRejectError("")
    setActionError(null)

    rejectMutation.mutate(
      {
        id: rejectTargetId,
        payload: {
          review_note: normalizedNote,
        },
      },
      {
        onSuccess: () => {
          reviewQueueTable.refetch()
          selectedReviewQuery.refetch()
          setIsRejectDialogOpen(false)
          setRejectTargetId("")
          setRejectNote("")
        },
        onError: (error) => {
          setActionError(
            getErrorMessage(error, "Gagal reject exam review submission."),
          )
        },
      },
    )
  }

  const columns: ColumnDef<AdminExamReviewSummaryResponseProps>[] = [
    {
      accessorKey: "exam_title",
      header: "Exam",
      cell: (info) => {
        const row = info.row.original

        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-gray-900">{row.exam_title}</p>
            <p className="text-xs text-gray-500">{row.version_label}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "creator",
      header: "Creator",
      cell: (info) => {
        const creator =
          info.getValue() as AdminExamReviewSummaryResponseProps["creator"]

        return (
          <div className="space-y-0.5">
            <p className="text-sm text-gray-900">{creator.name}</p>
            <p className="text-xs text-gray-500">{creator.email}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "submitted_at",
      header: "Submitted",
      cell: (info) => (
        <span className="text-sm text-gray-700">
          {formatDateTime(info.getValue() as string | null)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as ExamAuthoringReviewStatus

        return (
          <StatusBadge variant={statusVariantMap[status]}>
            {getExamAuthoringReviewStatusLabel(status)}
          </StatusBadge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: (info) => {
        const row = info.row.original
        const isPendingReview = row.status === "IN_REVIEW"

        return (
          <ActionsDropdown
            actions={[
              {
                label: "Open Detail",
                onClick: () => setSelectedReviewId(row.id),
              },
              ...(isPendingReview
                ? [
                    {
                      label: "Approve",
                      onClick: () => handleApprove(row.id),
                      warning: true,
                    },
                    {
                      label: "Reject",
                      onClick: () => handleOpenRejectDialog(row.id),
                      destructive: true,
                    },
                  ]
                : []),
            ]}
          />
        )
      },
    },
  ]

  if (!hasAdminAccess) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <PanelCard
          className="rounded-3xl"
          title="Admin Review Queue Terkunci"
          description="Akses halaman ini hanya untuk role ADMIN"
        >
          <p className="text-sm text-slate-600">
            Role saat ini belum memiliki izin untuk approve/reject exam version.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Admin
            </Link>
            <Link
              href="/panel"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Panel
            </Link>
          </div>
        </PanelCard>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <PanelCard
        className="rounded-3xl"
        title="Exam Review Queue"
        description="Review versi ujian dari creator lalu approve atau reject"
      >
        <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
          <p>
            Pending Review:{" "}
            <span className="font-medium text-gray-900">{summary.inReview}</span>
          </p>
          <p>
            Published:{" "}
            <span className="font-medium text-gray-900">{summary.published}</span>
          </p>
          <p>
            Rejected:{" "}
            <span className="font-medium text-gray-900">{summary.rejected}</span>
          </p>
        </div>
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Submission List"
        description="Pilih satu submission untuk melihat detail review"
      >
        <div className="mb-4">
          <Input
            label="Search Submission"
            placeholder="Cari judul exam atau nama creator"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {reviewQueueTable.error ? (
          <p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {getErrorMessage(
              reviewQueueTable.error,
              "Gagal memuat daftar submission review.",
            )}
          </p>
        ) : null}

        {actionError ? (
          <p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {actionError}
          </p>
        ) : null}

        <Table
          data={queue}
          columns={columns}
          isShowPagination={false}
          wrapperClassName="overflow-x-auto"
          thClassName="whitespace-nowrap"
          onRowClick={(row) => setSelectedReviewId(row.original.id)}
          isLoading={reviewQueueTable.isLoading}
        />
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Review Detail"
        description="Preview metadata versi ujian + feedback review"
      >
        {selectedReviewQuery.isLoading ? (
          <p className="text-sm text-gray-600">Memuat detail review...</p>
        ) : selectedReviewQuery.error ? (
          <p className="text-sm text-danger-700">
            {getErrorMessage(
              selectedReviewQuery.error,
              "Gagal memuat detail review submission.",
            )}
          </p>
        ) : selectedItem ? (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Title:</span> {selectedItem.exam_title}
              </p>
              <p>
                <span className="font-medium">Creator:</span>{" "}
                {selectedItem.creator.name}
              </p>
              <p>
                <span className="font-medium">Creator Email:</span>{" "}
                {selectedItem.creator.email}
              </p>
              <p>
                <span className="font-medium">Category:</span> {selectedItem.category}
              </p>
              <p>
                <span className="font-medium">Level:</span> {selectedItem.level}
              </p>
              <p>
                <span className="font-medium">Version:</span>{" "}
                {selectedItem.version_label}
              </p>
              <p>
                <span className="font-medium">Question Count:</span>{" "}
                {selectedItem.questions.length}
              </p>
              <p>
                <span className="font-medium">Submitted:</span>{" "}
                {formatDateTime(selectedItem.submitted_at)}
              </p>
              <div className="pt-2">
                <StatusBadge variant={statusVariantMap[selectedItem.status]}>
                  {getExamAuthoringReviewStatusLabel(selectedItem.status)}
                </StatusBadge>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Reviewer Note</p>
              <p className="text-sm text-gray-600">
                {selectedItem.review_note ||
                  "Belum ada review note. Lanjutkan approve/reject dari action table."}
              </p>

              {selectedItem.status === "IN_REVIEW" ? (
                <div className="flex gap-2 pt-2">
                  <Button
                    intent="primary"
                    type="button"
                    onClick={() => handleApprove(selectedItem.id)}
                    loading={approveMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    intent="danger"
                    type="button"
                    onClick={() => handleOpenRejectDialog(selectedItem.id)}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Tidak ada item yang dipilih.</p>
        )}
      </PanelCard>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Exam Version</DialogTitle>
            <DialogDescription>
              Berikan alasan reject agar creator bisa memperbaiki submission.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            label="Review Note"
            value={rejectNote}
            onChange={(event) => {
              setRejectNote(event.target.value)
              setRejectError("")
            }}
            rows={4}
            placeholder="Contoh: Tambahkan pembahasan untuk soal nomor 10-15"
          />

          {rejectError ? (
            <p className="text-sm text-danger-600">{rejectError}</p>
          ) : null}

          <DialogFooter className="mt-2">
            <Button
              intent="warning"
              textOnly
              type="button"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              intent="danger"
              type="button"
              onClick={handleConfirmReject}
              loading={rejectMutation.isPending}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
